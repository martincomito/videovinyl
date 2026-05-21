const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Venta = sequelize.define('Venta', {
  // Los campos se agregarán aquí
}, {
  tableName: 'ventas',
  timestamps: true,
});

module.exports = Venta;
