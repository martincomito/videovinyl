import 'dotenv/config';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario.js';
import { sequelize } from '../models/index.js';

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Faltan ADMIN_EMAIL o ADMIN_PASSWORD en el .env');
  process.exit(1);
}

await sequelize.authenticate();

const hashedPassword = await bcrypt.hash(password, 10);

const [usuario, created] = await Usuario.upsert({
  email,
  password: hashedPassword,
  nombre: 'Admin',
  apellido: 'VideoVinyl',
  rol: 'admin',
  estado: 'activo',
  debe_cambiar_password: false,
});

console.log(created ? 'Usuario admin creado.' : 'Usuario admin actualizado.');

await sequelize.close();
