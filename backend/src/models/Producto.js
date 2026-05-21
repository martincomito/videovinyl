const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
  // Los campos se agregarán aquí
}, {
  tableName: 'productos',
  timestamps: true,
});

module.exports = Producto;
