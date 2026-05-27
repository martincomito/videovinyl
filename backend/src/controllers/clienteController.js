const { Cliente, Venta, Alquiler, Producto, MetodoPago } = require('../models');

const getAll = async (req, res, next) => {
  try {
    const { estado } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    const clientes = await Cliente.findAll({
      where,
      order: [['apellido', 'ASC'], ['nombre', 'ASC']],
    });
    res.json(clientes);
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
    await cliente.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
