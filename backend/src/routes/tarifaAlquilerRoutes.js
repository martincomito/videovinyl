const { Router } = require('express');
const { getAll, upsert } = require('../controllers/tarifaAlquilerController');

const router = Router();

router.get('/', getAll);
router.put('/:tipo', upsert);

module.exports = router;
