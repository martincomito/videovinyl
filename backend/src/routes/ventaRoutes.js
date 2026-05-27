import express from 'express';
import { getAll, getById, create, anular } from '../controllers/ventaController.js';

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id/anular', anular);

export default router;
