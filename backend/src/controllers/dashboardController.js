import { Op } from 'sequelize';
import { Venta, Alquiler, Cliente, Producto } from '../models/index.js';

const getDashboard = async (req, res, next) => {
  try {
    const ahora = new Date();

    const inicioDia = new Date(ahora);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(ahora);
    finDia.setHours(23, 59, 59, 999);

    const haceUnMes = new Date(ahora);
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);

    const [
      ventasHoy,
      alquileresActivos,
      nuevosClientes,
      stockCritico,
      ventasRecientes,
      devolucionesPendientes,
    ] = await Promise.all([
      Venta.count({
        where: {
          fecha: { [Op.between]: [inicioDia, finDia] },
          estado: { [Op.ne]: 'anulada' },
        },
      }),

      Alquiler.count({
        where: { estado: 'activo' },
      }),

      Cliente.count({
        where: { createdAt: { [Op.gte]: haceUnMes } },
      }),

      Producto.count({
        where: { stock: { [Op.lte]: 2 }, eliminado: false },
      }),

      Venta.findAll({
        where: { estado: { [Op.ne]: 'anulada' } },
        order: [['fecha', 'DESC']],
        limit: 5,
        include: [
          { model: Cliente, as: 'cliente', attributes: ['nombre', 'apellido'] },
          { model: Producto, as: 'productos', attributes: ['titulo'], through: { attributes: [] } },
        ],
      }),

      Alquiler.findAll({
        where: { estado: 'activo' },
        order: [['fecha_devolucion_esperada', 'ASC']],
        limit: 5,
        include: [
          { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'apellido', 'dni'] },
          { model: Producto, as: 'producto', attributes: ['titulo', 'tipo'] },
        ],
      }),
    ]);

    res.json({
      tarjetas: {
        ventasHoy,
        alquileresActivos,
        nuevosClientes,
        stockCritico,
      },
      ventasRecientes: ventasRecientes.map((v) => ({
        id: v.id,
        numero: `#${String(v.id).padStart(4, '0')}`,
        cliente: v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : 'Cliente no socio',
        producto: v.productos?.[0]?.titulo ?? '—',
        total: v.total != null ? parseFloat(v.total) : 0,
        fecha: v.fecha,
      })),
      devolucionesPendientes: devolucionesPendientes.map((a) => ({
        id: a.id,
        clienteNombre: `${a.cliente.nombre} ${a.cliente.apellido}`,
        titulo: a.producto.titulo,
        tipo: a.producto.tipo,
        fechaDevolucion: a.fecha_devolucion_esperada,
        vencido: new Date(a.fecha_devolucion_esperada) < ahora,
        _cliente: { id: a.cliente.id, nombre: a.cliente.nombre, apellido: a.cliente.apellido, dni: a.cliente.dni },
        _alquiler: {
          id: a.id,
          fecha_devolucion_esperada: a.fecha_devolucion_esperada,
          monto: a.monto != null ? parseFloat(a.monto) : 0,
          producto: { tipo: a.producto.tipo, titulo: a.producto.titulo },
        },
      })),
    });
  } catch (error) {
    next(error);
  }
};

export { getDashboard };
