import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const VentaProducto = sequelize.define('VentaProducto', {
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'venta_productos',
  timestamps: false,
});

export default VentaProducto;
