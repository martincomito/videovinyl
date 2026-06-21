import { Op, QueryTypes } from 'sequelize';
import { sequelize, Venta, Alquiler, Cliente, Producto } from '../models/index.js';

const TIPOS = ['DVD', 'VHS', 'CD', 'VINILO'];

function toLocalDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const getReportes = async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const hoy = new Date();
    const todayStr = toLocalDateString(hoy);

    const desdeFecha = fechaInicio || todayStr;
    const hastaFecha = fechaFin || todayStr;

    const inicio = new Date(`${desdeFecha}T00:00:00`);
    const fin   = new Date(`${hastaFecha}T23:59:59.999`);

    // Ventas por tipo: cantidad e ingresos agrupados por formato
    const ventasPorTipo = await sequelize.query(
      `SELECT
         p.tipo,
         COALESCE(SUM(vp.cantidad), 0)::integer                        AS "cantidadVendida",
         COALESCE(SUM(vp.cantidad * vp.precio_unitario), 0)::numeric   AS "ingresos"
       FROM venta_productos vp
       JOIN ventas   v ON vp."ventaId"    = v.id
       JOIN productos p ON vp."productoId" = p.id
       WHERE v.fecha  BETWEEN :inicio AND :fin
         AND v.estado != 'anulada'
       GROUP BY p.tipo`,
      { replacements: { inicio, fin }, type: QueryTypes.SELECT }
    );

    // Garantizar los 4 tipos aunque no haya datos
    const formatoCards = TIPOS.map((tipo) => {
      const row = ventasPorTipo.find((r) => r.tipo === tipo);
      return { tipo, cantidadVendida: row ? parseInt(row.cantidadVendida, 10) : 0 };
    });

    const ingresosPorFormato = TIPOS.map((tipo) => {
      const row = ventasPorTipo.find((r) => r.tipo === tipo);
      return { tipo, total: row ? parseFloat(row.ingresos) : 0 };
    });

    // Ventas del rango
    const ventas = await Venta.findAll({
      where: {
        fecha: { [Op.between]: [inicio, fin] },
        estado: { [Op.ne]: 'anulada' },
      },
      order: [['fecha', 'DESC']],
      limit: 25,
      include: [
        { model: Cliente, as: 'cliente', attributes: ['nombre', 'apellido'] },
        { model: Producto, as: 'productos', attributes: ['titulo', 'tipo'], through: { attributes: [] } },
      ],
    });

    // Alquileres del rango
    const alquileres = await Alquiler.findAll({
      where: {
        fecha_inicio: { [Op.between]: [desdeFecha, hastaFecha] },
      },
      order: [['fecha_inicio', 'DESC']],
      limit: 25,
      include: [
        { model: Cliente,  as: 'cliente',  attributes: ['nombre', 'apellido'] },
        { model: Producto, as: 'producto', attributes: ['titulo', 'tipo'] },
      ],
    });

    const txVentas = ventas.map((v) => ({
      id: `v-${v.id}`,
      fechaHora: v.fecha,
      tipo: 'Venta',
      detalle: v.productos?.length > 1
        ? `${v.productos[0].titulo} y ${v.productos.length - 1} más`
        : v.productos?.[0]?.titulo
          ? `${v.productos[0].titulo} (${v.productos[0].tipo})`
          : '—',
      monto: parseFloat(v.total),
    }));

    const txAlquileres = alquileres.map((a) => ({
      id: `a-${a.id}`,
      fechaHora: a.fecha_inicio,
      tipo: 'Alquiler',
      detalle: a.producto ? `${a.producto.titulo} (${a.producto.tipo})` : '—',
      monto: parseFloat(a.monto),
    }));

    const transacciones = [...txVentas, ...txAlquileres]
      .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))
      .slice(0, 50);

    const productosStockBajo = await Producto.findAll({
      where: { stock: { [Op.lte]: 2 }, eliminado: false },
      attributes: ['id', 'titulo', 'tipo', 'stock'],
      order: [['stock', 'ASC'], ['titulo', 'ASC']],
    });

    res.json({ formatoCards, ingresosPorFormato, transacciones, productosStockBajo });
  } catch (error) {
    next(error);
  }
};

export { getReportes };
