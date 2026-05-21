const { Router } = require('express');
const clienteRoutes = require('./clienteRoutes');
const productoRoutes = require('./productoRoutes');
const ventaRoutes = require('./ventaRoutes');
const alquilerRoutes = require('./alquilerRoutes');

const router = Router();

router.use('/clientes', clienteRoutes);
router.use('/productos', productoRoutes);
router.use('/ventas', ventaRoutes);
router.use('/alquileres', alquilerRoutes);

module.exports = router;
