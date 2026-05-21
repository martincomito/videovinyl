const sequelize = require('../config/database');
const Cliente = require('./Cliente');
const Producto = require('./Producto');
const Venta = require('./Venta');
const Alquiler = require('./Alquiler');

// Las asociaciones entre modelos se definirán aquí

module.exports = { sequelize, Cliente, Producto, Venta, Alquiler };
