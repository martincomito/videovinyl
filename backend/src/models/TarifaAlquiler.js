import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TarifaAlquiler = sequelize.define('TarifaAlquiler', {
  tipo: {
    type: DataTypes.ENUM('DVD', 'VHS'),
    allowNull: false,
  },
  precio_por_dia: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'tarifas_alquiler',
  timestamps: true,
  indexes: [{ unique: true, fields: ['tipo'] }],
});

export default TarifaAlquiler;
