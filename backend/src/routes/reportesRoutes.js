import express from 'express';
import { getReportes } from '../controllers/reportesController.js';

const router = express.Router();

router.get('/', getReportes);

export default router;
