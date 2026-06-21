import { Op } from 'sequelize';
import { Cliente, Venta, Alquiler, Pago } from '../models/index.js';

/**
 * Recalcula si un cliente tiene deuda y actualiza su estado entre 'activo' y 'con_deuda'.
 * No modifica clientes con estado 'inactivo'.
 */
export async function sincronizarEstadoCliente(clienteId) {
  if (!clienteId) return;

  const cliente = await Cliente.findByPk(clienteId);
  if (!cliente || cliente.estado === 'inactivo') return;

  const [ventas, alquileres] = await Promise.all([
    Venta.findAll({
      where: { clienteId, estado: 'pendiente' },
      include: [{ model: Pago, as: 'pagos', attributes: ['monto'] }],
    }),
    Alquiler.findAll({
      where: {
        clienteId,
        estado: 'activo',
        fecha_devolucion_esperada: { [Op.lt]: new Date() },
      },
      include: [{ model: Pago, as: 'pagos', attributes: ['monto'] }],
    }),
  ]);

  const tieneDeuda =
    ventas.some(v => {
      const pagado = v.pagos.reduce((s, p) => s + parseFloat(p.monto), 0);
      return parseFloat(v.total) - pagado > 0.001;
    }) ||
    alquileres.some(a => {
      const pagado = a.pagos.reduce((s, p) => s + parseFloat(p.monto), 0);
      return parseFloat(a.monto) - pagado > 0.001;
    });

  const nuevoEstado = tieneDeuda ? 'con_deuda' : 'activo';
  if (cliente.estado !== nuevoEstado) {
    await cliente.update({ estado: nuevoEstado });
  }
}
