const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {
  // Los campos se agregarán aquí
}, {
  tableName: 'clientes',
  timestamps: true,
});

module.exports = Cliente;
