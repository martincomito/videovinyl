const { sequelize, Venta, VentaProducto, Producto, Cliente, Usuario, MetodoPago } = require('../models');

const ventaConDetalle = (id) =>
  Venta.findByPk(id, {
    include: [
      { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'apellido', 'dni'] },
      { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'apellido'] },
      { model: MetodoPago, as: 'metodoPago', attributes: ['id', 'nombre'] },
      { model: Producto, as: 'productos', through: { attributes: ['cantidad', 'precio_unitario'] } },
    ],
  });

const getAll = async (req, res, next) => {
  try {
    const { estado } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    const ventas = await Venta.findAll({
      where,
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'apellido', 'dni'] },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'apellido'] },
        { model: MetodoPago, as: 'metodoPago', attributes: ['id', 'nombre'] },
        { model: Producto, as: 'productos', through: { attributes: ['cantidad', 'precio_unitario'] } },
      ],
      order: [['fecha', 'DESC']],
    });
    res.json(ventas);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const venta = await ventaConDetalle(req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(venta);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { clienteId, usuarioId, metodoPagoId, items, estado, fecha } = req.body;

    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'La venta debe incluir al menos un producto' });
    }

    let total = 0;
    const itemsResueltos = [];

    for (const item of items) {
      const producto = await Producto.findByPk(item.productoId, { transaction: t, lock: true });
      if (!producto) {
        await t.rollback();
        return res.status(404).json({ error: `Producto ${item.productoId} no encontrado` });
      }
      if (producto.stock < item.cantidad) {
        await t.rollback();
        return res.status(400).json({
          error: `Stock insuficiente para "${producto.titulo}". Disponible: ${producto.stock}`,
        });
      }
      const precio_unitario = parseFloat(producto.precio_venta);
      total += precio_unitario * item.cantidad;
      itemsResueltos.push({ productoId: item.productoId, cantidad: item.cantidad, precio_unitario, producto });
    }

    const venta = await Venta.create(
      { clienteId, usuarioId, metodoPagoId, total, estado: estado || 'completada', fecha: fecha || new Date() },
      { transaction: t }
    );

    for (const item of itemsResueltos) {
      await VentaProducto.create(
        { ventaId: venta.id, productoId: item.productoId, cantidad: item.cantidad, precio_unitario: item.precio_unitario },
        { transaction: t }
      );
      await item.producto.decrement('stock', { by: item.cantidad, transaction: t });
    }

    await t.commit();
    res.status(201).json(await ventaConDetalle(venta.id));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const anular = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const venta = await Venta.findByPk(req.params.id, { transaction: t, lock: true });
    if (!venta) {
      await t.rollback();
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    if (venta.estado === 'anulada') {
      await t.rollback();
      return res.status(400).json({ error: 'La venta ya está anulada' });
    }

    const ventaProductos = await VentaProducto.findAll({ where: { ventaId: venta.id }, transaction: t });
    for (const vp of ventaProductos) {
      const producto = await Producto.findByPk(vp.productoId, { transaction: t, lock: true });
      await producto.increment('stock', { by: vp.cantidad, transaction: t });
    }

    await venta.update({ estado: 'anulada' }, { transaction: t });
    await t.commit();
    res.json(await ventaConDetalle(venta.id));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

module.exports = { getAll, getById, create, anular };
