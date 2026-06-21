import 'dotenv/config';
import app from './app.js';
import { sequelize } from './models/index.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Conexión con la base de datos establecida.');
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados.');
    // sequelize.sync({ alter: true }) no elimina restricciones NOT NULL en PostgreSQL,
    // así que se fuerza manualmente para la columna opcional metodoPagoId.
    await sequelize.query('ALTER TABLE alquileres ALTER COLUMN "metodoPagoId" DROP NOT NULL').catch(() => {});
    await sequelize.query('ALTER TABLE ventas ALTER COLUMN "clienteId" DROP NOT NULL').catch(() => {});
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
}

startServer();
