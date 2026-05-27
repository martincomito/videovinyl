import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Alquiler = sequelize.define('Alquiler', {
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  metodoPagoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  fecha_devolucion_esperada: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  fecha_devolucion_real: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('activo', 'devuelto', 'vencido'),
    allowNull: false,
    defaultValue: 'activo',
  },
}, {
  tableName: 'alquileres',
  timestamps: true,
});

export default Alquiler;
