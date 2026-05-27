import { Usuario } from '../models/index.js';

const getAll = async (req, res, next) => {
  try {
    const { estado, rol } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    if (rol) where.rol = rol;
    const usuarios = await Usuario.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['apellido', 'ASC'], ['nombre', 'ASC']],
    });
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { nombre, apellido, email, password, rol, estado } = req.body;
    const usuario = await Usuario.create({ nombre, apellido, email, password, rol, estado });
    const { password: _, ...data } = usuario.toJSON();
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    const { nombre, apellido, email, password, rol, estado } = req.body;
    const datos = { nombre, apellido, email, rol, estado };
    if (password) datos.password = password;
    await usuario.update(datos);
    const { password: _, ...data } = usuario.toJSON();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    await usuario.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { getAll, getById, create, update, remove };
