import express from 'express';
import { getAll, upsert } from '../controllers/tarifaAlquilerController.js';

const router = express.Router();

router.get('/', getAll);
router.put('/:tipo', upsert);

export default router;
