const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alquiler = sequelize.define('Alquiler', {
  // Los campos se agregarán aquí
}, {
  tableName: 'alquileres',
  timestamps: true,
});

module.exports = Alquiler;
