import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Pago = sequelize.define('Pago', {
  metodoPagoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ventaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  alquilerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'pagos',
  timestamps: true,
});

export default Pago;
