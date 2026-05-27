const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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

module.exports = MetodoPago;
