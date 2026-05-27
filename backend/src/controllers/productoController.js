import { Producto, Alquiler } from '../models/index.js';

const calcularEstadoInventario = (producto, cantidadAlquileresActivos) => {
  if (producto.stock > 0) return 'disponible';
  if (Producto.TIPOS_ALQUILABLES.includes(producto.tipo) && cantidadAlquileresActivos > 0) return 'alquilado';
  return 'agotado';
};

const getAll = async (req, res, next) => {
  try {
    const { tipo, estado } = req.query;
    const where = {};
    if (tipo) where.tipo = tipo;

    const productos = await Producto.findAll({
      where,
      include: [{
        model: Alquiler,
        as: 'alquileres',
        where: { estado: 'activo' },
        required: false,
        attributes: ['id'],
      }],
      order: [['titulo', 'ASC']],
    });

    const result = productos.map(p => {
      const data = p.toJSON();
      const estadoInventario = calcularEstadoInventario(p, data.alquileres.length);
      delete data.alquileres;
      return { ...data, estadoInventario };
    });

    const filtered = estado ? result.filter(p => p.estadoInventario === estado) : result;
    res.json(filtered);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const producto = await Producto.findByPk(req.params.id, {
      include: [{
        model: Alquiler,
        as: 'alquileres',
        where: { estado: 'activo' },
        required: false,
        attributes: ['id'],
      }],
    });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    const data = producto.toJSON();
    const estadoInventario = calcularEstadoInventario(producto, data.alquileres.length);
    delete data.alquileres;
    res.json({ ...data, estadoInventario });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { titulo, tipo, descripcion, precio_venta, stock } = req.body;
    const producto = await Producto.create({ titulo, tipo, descripcion, precio_venta, stock });
    res.status(201).json(producto);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    const { titulo, tipo, descripcion, precio_venta, stock } = req.body;
    await producto.update({ titulo, tipo, descripcion, precio_venta, stock });
    res.json(producto);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    await producto.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { getAll, getById, create, update, remove };
