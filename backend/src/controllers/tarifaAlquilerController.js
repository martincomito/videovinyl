const { TarifaAlquiler } = require('../models');

const getAll = async (req, res, next) => {
  try {
    const tarifas = await TarifaAlquiler.findAll({ order: [['tipo', 'ASC']] });
    res.json(tarifas);
  } catch (error) {
    next(error);
  }
};

const upsert = async (req, res, next) => {
  try {
    const { tipo } = req.params;
    const { precio_por_dia } = req.body;
    const tarifa = await TarifaAlquiler.findOne({ where: { tipo } });
    if (tarifa) {
      await tarifa.update({ precio_por_dia });
      res.json(tarifa);
    } else {
      const nueva = await TarifaAlquiler.create({ tipo, precio_por_dia });
      res.status(201).json(nueva);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, upsert };
