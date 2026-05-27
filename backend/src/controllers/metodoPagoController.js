const { MetodoPago } = require('../models');

const getAll = async (req, res, next) => {
  try {
    const metodos = await MetodoPago.findAll({ order: [['nombre', 'ASC']] });
    res.json(metodos);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    const metodo = await MetodoPago.create({ nombre });
    res.status(201).json(metodo);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const metodo = await MetodoPago.findByPk(req.params.id);
    if (!metodo) return res.status(404).json({ error: 'Método de pago no encontrado' });
    const { nombre, activo } = req.body;
    await metodo.update({ nombre, activo });
    res.json(metodo);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update };
