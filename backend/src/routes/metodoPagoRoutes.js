import express from 'express';
import { getAll, create, update } from '../controllers/metodoPagoController.js';

const router = express.Router();

router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);

export default router;
