const { Router } = require('express');
const clienteRoutes = require('./clienteRoutes');
const productoRoutes = require('./productoRoutes');
const ventaRoutes = require('./ventaRoutes');
const alquilerRoutes = require('./alquilerRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const tarifaAlquilerRoutes = require('./tarifaAlquilerRoutes');
const metodoPagoRoutes = require('./metodoPagoRoutes');
const pagoRoutes = require('./pagoRoutes');

const router = Router();

router.use('/clientes', clienteRoutes);
router.use('/productos', productoRoutes);
router.use('/ventas', ventaRoutes);
router.use('/alquileres', alquilerRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/tarifas-alquiler', tarifaAlquilerRoutes);
router.use('/metodos-pago', metodoPagoRoutes);
router.use('/pagos', pagoRoutes);

module.exports = router;
