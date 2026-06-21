import { Op } from 'sequelize';
import { sequelize, Venta, VentaProducto, Producto, Cliente, Usuario, MetodoPago } from '../models/index.js';

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
    const { estado, q, pagina = 1, limite = 10 } = req.query;
    const where = {};
    if (estado) where.estado = estado;

    if (q) {
      where[Op.or] = [
        { '$cliente.nombre$': { [Op.iLike]: `%${q}%` } },
        { '$cliente.apellido$': { [Op.iLike]: `%${q}%` } },
        { '$cliente.dni$': { [Op.iLike]: `%${q}%` } },
      ];
    }

    const limit = Math.min(Math.max(parseInt(limite) || 10, 1), 100);
    const pg = Math.max(parseInt(pagina) || 1, 1);
    const offset = (pg - 1) * limit;

    const { count, rows } = await Venta.findAndCountAll({
      where,
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'apellido', 'dni'] },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'apellido'] },
        { model: MetodoPago, as: 'metodoPago', attributes: ['id', 'nombre'] },
      ],
      order: [['fecha', 'DESC']],
      limit,
      offset,
      subQuery: false,
      distinct: true,
    });

    res.json({
      datos: rows,
      total: count,
      pagina: pg,
      totalPaginas: Math.ceil(count / limit) || 1,
    });
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

export { getAll, getById, create, anular };
