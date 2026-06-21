import { Op } from 'sequelize';
import { Producto, Alquiler, TarifaAlquiler } from '../models/index.js';

const calcularEstadoInventario = (producto, cantidadAlquileresActivos) => {
  if (producto.stock > 0) return 'disponible';
  if (Producto.TIPOS_ALQUILABLES.includes(producto.tipo) && cantidadAlquileresActivos > 0) return 'alquilado';
  return 'agotado';
};

const getAll = async (req, res, next) => {
  try {
    const { tipo, estado: estadoFilter, q, pagina = 1, limite = 10 } = req.query;
    const where = { eliminado: false };
    if (tipo) where.tipo = tipo;

    if (q) {
      where[Op.or] = [
        { titulo: { [Op.iLike]: `%${q}%` } },
        { descripcion: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const [productos, tarifas] = await Promise.all([
      Producto.findAll({
        where,
        include: [{ model: Alquiler, as: 'alquileres', where: { estado: 'activo' }, required: false, attributes: ['id'] }],
        order: [['titulo', 'ASC']],
      }),
      TarifaAlquiler.findAll(),
    ]);

    const tarifaMap = Object.fromEntries(tarifas.map(t => [t.tipo, t.precio_por_dia]));

    let result = productos.map(p => {
      const data = p.toJSON();
      const estadoInventario = calcularEstadoInventario(p, data.alquileres.length);
      delete data.alquileres;
      return { ...data, estadoInventario, precioAlquiler: tarifaMap[data.tipo] ?? null };
    });

    if (estadoFilter) result = result.filter(p => p.estadoInventario === estadoFilter);

    const limit = Math.min(Math.max(parseInt(limite) || 10, 1), 100);
    const pg = Math.max(parseInt(pagina) || 1, 1);
    const total = result.length;
    const offset = (pg - 1) * limit;

    res.json({
      datos: result.slice(offset, offset + limit),
      total,
      pagina: pg,
      totalPaginas: Math.ceil(total / limit) || 1,
    });
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
    const { titulo, precio_venta, stock } = req.body;
    const datos = {};
    if (titulo !== undefined) datos.titulo = titulo;
    if (precio_venta !== undefined) datos.precio_venta = precio_venta;
    if (stock !== undefined) datos.stock = stock;
    await producto.update(datos);
    res.json(producto);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    await producto.update({ eliminado: true });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { getAll, getById, create, update, remove };
