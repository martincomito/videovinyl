import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { Usuario } from '../models/index.js';

const getAll = async (req, res, next) => {
  try {
    const { estado, rol, q, pagina = 1, limite = 10 } = req.query;
    const where = { eliminado: false };
    if (estado) where.estado = estado;
    if (rol) where.rol = rol;

    if (q) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${q}%` } },
        { apellido: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const limit = Math.min(Math.max(parseInt(limite) || 10, 1), 100);
    const pg = Math.max(parseInt(pagina) || 1, 1);
    const offset = (pg - 1) * limit;

    const { count, rows } = await Usuario.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['apellido', 'ASC'], ['nombre', 'ASC']],
      limit,
      offset,
    });

    res.json({
      datos: rows,
      total: count,
      pagina: pg,
      totalPaginas: Math.ceil(count / limit) || 1,
    });
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
    const { nombre, apellido, email, password, rol, estado, avatar } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, apellido, email, password: hash, rol, estado, avatar: avatar || null });
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

    const { nombre, apellido, email, password, rol, estado, avatar } = req.body;
    const esPropioUsuario = parseInt(req.params.id) === req.usuario.id;

    if (esPropioUsuario && estado === 'inactivo') {
      return res.status(403).json({ error: 'No podés deshabilitar tu propia cuenta.' });
    }

    const datos = {};
    if (nombre !== undefined) datos.nombre = nombre;
    if (apellido !== undefined) datos.apellido = apellido;
    if (email !== undefined) datos.email = email;
    if (rol !== undefined) datos.rol = rol;
    if (estado !== undefined) datos.estado = estado;
    if (avatar !== undefined) datos.avatar = avatar || null;
    if (password) datos.password = await bcrypt.hash(password, 10);
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
    await usuario.update({ eliminado: true });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { getAll, getById, create, update, remove };
