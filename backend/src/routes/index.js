import express from 'express';
import authRoutes from './authRoutes.js';
import clienteRoutes from './clienteRoutes.js';
import productoRoutes from './productoRoutes.js';
import ventaRoutes from './ventaRoutes.js';
import alquilerRoutes from './alquilerRoutes.js';
import usuarioRoutes from './usuarioRoutes.js';
import tarifaAlquilerRoutes from './tarifaAlquilerRoutes.js';
import metodoPagoRoutes from './metodoPagoRoutes.js';
import pagoRoutes from './pagoRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/clientes', clienteRoutes);
router.use('/productos', productoRoutes);
router.use('/ventas', ventaRoutes);
router.use('/alquileres', alquilerRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/tarifas-alquiler', tarifaAlquilerRoutes);
router.use('/metodos-pago', metodoPagoRoutes);
router.use('/pagos', pagoRoutes);

export default router;
