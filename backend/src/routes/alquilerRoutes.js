const { Router } = require('express');
const { getAll, getById, create, registrarDevolucion } = require('../controllers/alquilerController');

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id/devolucion', registrarDevolucion);

module.exports = router;
