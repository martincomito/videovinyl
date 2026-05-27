import express from 'express';
import { getAll, getById, create, registrarDevolucion } from '../controllers/alquilerController.js';

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id/devolucion', registrarDevolucion);

export default router;
