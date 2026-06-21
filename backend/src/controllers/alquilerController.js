import { Op } from 'sequelize';
import { sequelize, Alquiler, Producto, Cliente, Usuario, MetodoPago, TarifaAlquiler } from '../models/index.js';

const alquilerConDetalle = (id) =>
  Alquiler.findByPk(id, {
    include: [
      { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'apellido', 'dni'] },
      { model: Producto, as: 'producto', attributes: ['id', 'titulo', 'tipo'] },
      { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'apellido'] },
      { model: MetodoPago, as: 'metodoPago', attributes: ['id', 'nombre'] },
    ],
  });

const getAll = async (req, res, next) => {
  try {
    const { estado, q, clienteId, pagina = 1, limite = 10 } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    if (clienteId) where.clienteId = clienteId;

    if (q) {
      where[Op.or] = [
        { '$cliente.nombre$': { [Op.iLike]: `%${q}%` } },
        { '$cliente.apellido$': { [Op.iLike]: `%${q}%` } },
        { '$producto.titulo$': { [Op.iLike]: `%${q}%` } },
      ];
    }

    const limit = Math.min(Math.max(parseInt(limite) || 10, 1), 100);
    const pg = Math.max(parseInt(pagina) || 1, 1);
    const offset = (pg - 1) * limit;

    const { count, rows } = await Alquiler.findAndCountAll({
      where,
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'apellido', 'dni'] },
        { model: Producto, as: 'producto', attributes: ['id', 'titulo', 'tipo'] },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'apellido'] },
        { model: MetodoPago, as: 'metodoPago', attributes: ['id', 'nombre'] },
      ],
      order: [['fecha_inicio', 'DESC']],
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
    const alquiler = await alquilerConDetalle(req.params.id);
    if (!alquiler) return res.status(404).json({ error: 'Alquiler no encontrado' });
    res.json(alquiler);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { clienteId, productoId, usuarioId, metodoPagoId, fecha_inicio, fecha_devolucion_esperada } = req.body;

    const producto = await Producto.findByPk(productoId, { transaction: t, lock: true });
    if (!producto) {
      await t.rollback();
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    if (!Producto.TIPOS_ALQUILABLES.includes(producto.tipo)) {
      await t.rollback();
      return res.status(400).json({ error: `Los productos de tipo "${producto.tipo}" no están disponibles para alquiler` });
    }
    if (producto.stock < 1) {
      await t.rollback();
      return res.status(400).json({ error: 'No hay unidades disponibles para alquilar' });
    }

    const tarifa = await TarifaAlquiler.findOne({ where: { tipo: producto.tipo }, transaction: t });
    if (!tarifa) {
      await t.rollback();
      return res.status(400).json({ error: `No hay tarifa de alquiler configurada para tipo "${producto.tipo}"` });
    }

    const inicio = new Date(fecha_inicio || Date.now());
    const fin = new Date(fecha_devolucion_esperada);
    const dias = Math.max(1, Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)));
    const monto = parseFloat(tarifa.precio_por_dia) * dias;

    const alquiler = await Alquiler.create(
      { clienteId, productoId, usuarioId, metodoPagoId, fecha_inicio: inicio, fecha_devolucion_esperada: fin, monto, estado: 'activo' },
      { transaction: t }
    );

    await producto.decrement('stock', { by: 1, transaction: t });
    await t.commit();
    res.status(201).json(await alquilerConDetalle(alquiler.id));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const registrarDevolucion = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const alquiler = await Alquiler.findByPk(req.params.id, { transaction: t, lock: true });
    if (!alquiler) {
      await t.rollback();
      return res.status(404).json({ error: 'Alquiler no encontrado' });
    }
    if (alquiler.estado === 'devuelto') {
      await t.rollback();
      return res.status(400).json({ error: 'El alquiler ya fue devuelto' });
    }

    const { fecha_devolucion_real, metodoPagoId, recargo_cobrado, estado_producto_devuelto } = req.body;
    const fechaReal = fecha_devolucion_real || new Date().toISOString().split('T')[0];

    await alquiler.update(
      {
        estado: 'devuelto',
        fecha_devolucion_real: fechaReal,
        metodoPagoId: metodoPagoId || null,
        recargo_cobrado: recargo_cobrado ?? false,
        estado_producto_devuelto: estado_producto_devuelto || null,
      },
      { transaction: t }
    );

    const producto = await Producto.findByPk(alquiler.productoId, { transaction: t, lock: true });
    await producto.increment('stock', { by: 1, transaction: t });

    await t.commit();
    res.json(await alquilerConDetalle(alquiler.id));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export { getAll, getById, create, registrarDevolucion };
