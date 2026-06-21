import express from 'express';
import { getAll, getById, create, update, remove, cambiarPassword } from '../controllers/usuarioController.js';

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/cambiar-password', cambiarPassword);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
