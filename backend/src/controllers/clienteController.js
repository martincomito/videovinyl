import { Op } from 'sequelize';
import { Cliente, Venta, Alquiler, Producto, MetodoPago, Pago } from '../models/index.js';

const getAll = async (req, res, next) => {
  try {
    const { estado, q, pagina = 1, limite = 10 } = req.query;
    const where = {};
    if (estado) where.estado = estado;

    if (q) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${q}%` } },
        { apellido: { [Op.iLike]: `%${q}%` } },
        { dni: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
        { telefono: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const limit = Math.min(Math.max(parseInt(limite) || 10, 1), 100);
    const pg = Math.max(parseInt(pagina) || 1, 1);
    const offset = (pg - 1) * limit;

    const { count, rows } = await Cliente.findAndCountAll({
      where,
      order: [['apellido', 'ASC'], ['nombre', 'ASC']],
      limit,
      offset,
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
    const cliente = await Cliente.findByPk(req.params.id, {
      include: [
        {
          model: Venta,
          as: 'ventas',
          include: [{ model: MetodoPago, as: 'metodoPago', attributes: ['id', 'nombre'] }],
        },
        {
          model: Alquiler,
          as: 'alquileres',
          include: [
            { model: Producto, as: 'producto', attributes: ['id', 'titulo', 'tipo'] },
            { model: MetodoPago, as: 'metodoPago', attributes: ['id', 'nombre'] },
          ],
        },
      ],
    });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { nombre, apellido, dni, telefono, email, estado } = req.body;
    const cliente = await Cliente.create({ nombre, apellido, dni, telefono, email, estado });
    res.status(201).json(cliente);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    const { nombre, apellido, dni, telefono, email, estado } = req.body;
    await cliente.update({ nombre, apellido, dni, telefono, email, estado });
    res.json(cliente);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    await cliente.update({ estado: 'inactivo' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getDeuda = async (req, res, next) => {
  try {
    const clienteId = req.params.id;
    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    const ventas = await Venta.findAll({
      where: { clienteId, estado: 'pendiente' },
      include: [{ model: Pago, as: 'pagos', attributes: ['monto'] }],
    });

    const alquileres = await Alquiler.findAll({
      where: {
        clienteId,
        estado: 'activo',
        fecha_devolucion_esperada: { [Op.lt]: new Date() },
      },
      include: [
        { model: Pago, as: 'pagos', attributes: ['monto'] },
        { model: Producto, as: 'producto', attributes: ['id', 'titulo'] },
      ],
    });

    const items = [
      ...ventas.map(v => {
        const pagado = v.pagos.reduce((s, p) => s + parseFloat(p.monto), 0);
        const saldo = parseFloat(v.total) - pagado;
        return { id: v.id, tipo: 'venta', descripcion: `Venta #${v.id}`, total: parseFloat(v.total), pagado, saldo, fecha: v.fecha };
      }).filter(v => v.saldo > 0.001),
      ...alquileres.map(a => {
        const pagado = a.pagos.reduce((s, p) => s + parseFloat(p.monto), 0);
        const saldo = parseFloat(a.monto) - pagado;
        return { id: a.id, tipo: 'alquiler', descripcion: a.producto?.titulo ?? `Alquiler #${a.id}`, total: parseFloat(a.monto), pagado, saldo, fecha: a.fecha_inicio };
      }).filter(a => a.saldo > 0.001),
    ];

    const totalDeuda = items.reduce((sum, i) => sum + i.saldo, 0);
    res.json({ items, totalDeuda });
  } catch (error) {
    next(error);
  }
};

export { getAll, getById, create, update, remove, getDeuda };
