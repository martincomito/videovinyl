import sequelize from '../config/database.js';
import Cliente from './Cliente.js';
import Producto from './Producto.js';
import Venta from './Venta.js';
import Alquiler from './Alquiler.js';
import Usuario from './Usuario.js';
import TarifaAlquiler from './TarifaAlquiler.js';
import MetodoPago from './MetodoPago.js';
import VentaProducto from './VentaProducto.js';
import Pago from './Pago.js';

// Venta ↔ Cliente
Venta.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });
Cliente.hasMany(Venta, { foreignKey: 'clienteId', as: 'ventas' });

// Venta ↔ Usuario
Venta.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
Usuario.hasMany(Venta, { foreignKey: 'usuarioId', as: 'ventas' });

// Venta ↔ MetodoPago
Venta.belongsTo(MetodoPago, { foreignKey: 'metodoPagoId', as: 'metodoPago' });
MetodoPago.hasMany(Venta, { foreignKey: 'metodoPagoId', as: 'ventas' });

// Venta ↔ Producto (many-to-many via VentaProducto)
Venta.belongsToMany(Producto, { through: VentaProducto, foreignKey: 'ventaId', as: 'productos' });
Producto.belongsToMany(Venta, { through: VentaProducto, foreignKey: 'productoId', as: 'ventas' });

// Alquiler ↔ Cliente
Alquiler.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });
Cliente.hasMany(Alquiler, { foreignKey: 'clienteId', as: 'alquileres' });

// Alquiler ↔ Producto
Alquiler.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });
Producto.hasMany(Alquiler, { foreignKey: 'productoId', as: 'alquileres' });

// Alquiler ↔ Usuario
Alquiler.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
Usuario.hasMany(Alquiler, { foreignKey: 'usuarioId', as: 'alquileres' });

// Alquiler ↔ MetodoPago
Alquiler.belongsTo(MetodoPago, { foreignKey: 'metodoPagoId', as: 'metodoPago' });
MetodoPago.hasMany(Alquiler, { foreignKey: 'metodoPagoId', as: 'alquileres' });

// Pago ↔ MetodoPago
Pago.belongsTo(MetodoPago, { foreignKey: 'metodoPagoId', as: 'metodoPago' });
MetodoPago.hasMany(Pago, { foreignKey: 'metodoPagoId', as: 'pagos' });

// Pago ↔ Venta
Pago.belongsTo(Venta, { foreignKey: 'ventaId', as: 'venta' });
Venta.hasMany(Pago, { foreignKey: 'ventaId', as: 'pagos' });

// Pago ↔ Alquiler
Pago.belongsTo(Alquiler, { foreignKey: 'alquilerId', as: 'alquiler' });
Alquiler.hasMany(Pago, { foreignKey: 'alquilerId', as: 'pagos' });

export {
  sequelize,
  Cliente,
  Producto,
  Venta,
  Alquiler,
  Usuario,
  TarifaAlquiler,
  MetodoPago,
  VentaProducto,
  Pago,
};
