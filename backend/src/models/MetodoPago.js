import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MetodoPago = sequelize.define('MetodoPago', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'metodos_pago',
  timestamps: true,
});

export default MetodoPago;
