import express from 'express';
import { getAll, getById, create } from '../controllers/pagoController.js';

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);

export default router;
