import { Pago, Venta, Alquiler, MetodoPago } from '../models/index.js';

const getAll = async (req, res, next) => {
  try {
    const { ventaId, alquilerId } = req.query;
    const where = {};
    if (ventaId) where.ventaId = ventaId;
    if (alquilerId) where.alquilerId = alquilerId;
    const pagos = await Pago.findAll({
      where,
      include: [{ model: MetodoPago, as: 'metodoPago', attributes: ['id', 'nombre'] }],
      order: [['fecha', 'DESC']],
    });
    res.json(pagos);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const pago = await Pago.findByPk(req.params.id, {
      include: [
        { model: MetodoPago, as: 'metodoPago' },
        { model: Venta, as: 'venta' },
        { model: Alquiler, as: 'alquiler' },
      ],
    });
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json(pago);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { metodoPagoId, ventaId, alquilerId, monto, fecha, notas } = req.body;
    if (!ventaId && !alquilerId) {
      return res.status(400).json({ error: 'El pago debe estar asociado a una venta o un alquiler' });
    }
    if (ventaId && alquilerId) {
      return res.status(400).json({ error: 'El pago debe asociarse a una venta O un alquiler, no a ambos' });
    }
    const pago = await Pago.create({ metodoPagoId, ventaId, alquilerId, monto, fecha: fecha || new Date(), notas });
    res.status(201).json(pago);
  } catch (error) {
    next(error);
  }
};

export { getAll, getById, create };
