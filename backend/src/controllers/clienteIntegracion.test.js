/**
 * Pruebas de integración – Clientes
 *
 * Ejercitan la cadena completa:
 *   petición HTTP → Express router → authMiddleware → controller → modelo (mock)
 *
 * La única capa que se reemplaza es la base de datos (Sequelize), porque no
 * contamos con una DB de prueba en el entorno local. Todo lo demás es real.
 */

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { Cliente } from '../models/index.js';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('sequelize', () => ({
  Op: { or: Symbol('or'), iLike: Symbol('iLike') },
}));

vi.mock('../models/index.js', () => ({
  Cliente: {
    findAndCountAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
  },
  Venta: {},
  Alquiler: {},
  Producto: {},
  MetodoPago: {},
}));

// ── Token de prueba ───────────────────────────────────────────────────────────

const TEST_SECRET = 'secreto_de_prueba';

beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
});

function tokenValido() {
  return `Bearer ${jwt.sign({ id: 1, rol: 'admin' }, TEST_SECRET, { expiresIn: '1h' })}`;
}

// ── Datos de prueba ───────────────────────────────────────────────────────────

const clienteEjemplo = {
  id: 1,
  nombre: 'Ana',
  apellido: 'Pérez',
  dni: '30000001',
  telefono: '1122334455',
  email: 'ana@test.com',
  estado: 'activo',
};

const clienteConUpdate = {
  ...clienteEjemplo,
  update: vi.fn().mockImplementation(async function (data) {
    Object.assign(this, data);
    return this;
  }),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Integración GET /api/clientes', () => {
  beforeEach(() => {
    Cliente.findAndCountAll.mockResolvedValue({ count: 1, rows: [clienteEjemplo] });
  });

  it('devuelve 401 si no se envía token', async () => {
    const res = await request(app).get('/api/clientes');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('devuelve 401 con un token malformado', async () => {
    const res = await request(app)
      .get('/api/clientes')
      .set('Authorization', 'Bearer token.invalido.aqui');
    expect(res.status).toBe(401);
  });

  it('devuelve 200 con lista paginada cuando el token es válido', async () => {
    const res = await request(app)
      .get('/api/clientes')
      .set('Authorization', tokenValido());

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      datos: expect.any(Array),
      total: 1,
      pagina: 1,
      totalPaginas: 1,
    });
  });

  it('incluye los datos del cliente en la respuesta', async () => {
    const res = await request(app)
      .get('/api/clientes')
      .set('Authorization', tokenValido());

    expect(res.body.datos[0]).toMatchObject({ nombre: 'Ana', apellido: 'Pérez' });
  });
});

describe('Integración GET /api/clientes/:id', () => {
  it('devuelve 200 con el cliente cuando existe', async () => {
    Cliente.findByPk.mockResolvedValue(clienteEjemplo);

    const res = await request(app)
      .get('/api/clientes/1')
      .set('Authorization', tokenValido());

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, nombre: 'Ana' });
  });

  it('devuelve 404 cuando el cliente no existe', async () => {
    Cliente.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/clientes/999')
      .set('Authorization', tokenValido());

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Cliente no encontrado');
  });
});

describe('Integración POST /api/clientes', () => {
  it('crea un cliente y responde con 201 y los datos guardados', async () => {
    Cliente.create.mockResolvedValue(clienteEjemplo);

    const res = await request(app)
      .post('/api/clientes')
      .set('Authorization', tokenValido())
      .send({
        nombre: 'Ana',
        apellido: 'Pérez',
        dni: '30000001',
        telefono: '1122334455',
        email: 'ana@test.com',
        estado: 'activo',
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ nombre: 'Ana', apellido: 'Pérez' });
  });

  it('devuelve 401 si se intenta crear sin autenticación', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .send({ nombre: 'Sin', apellido: 'Token' });

    expect(res.status).toBe(401);
  });
});

describe('Integración PUT /api/clientes/:id', () => {
  it('actualiza el cliente y devuelve los datos modificados', async () => {
    Cliente.findByPk.mockResolvedValue(clienteConUpdate);

    const res = await request(app)
      .put('/api/clientes/1')
      .set('Authorization', tokenValido())
      .send({ nombre: 'Ana', apellido: 'Gómez', dni: '30000001',
              telefono: '9988776655', email: 'ana@test.com', estado: 'activo' });

    expect(res.status).toBe(200);
    expect(clienteConUpdate.update).toHaveBeenCalled();
  });

  it('devuelve 404 si el cliente a actualizar no existe', async () => {
    Cliente.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/clientes/999')
      .set('Authorization', tokenValido())
      .send({ nombre: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('Integración DELETE /api/clientes/:id', () => {
  it('devuelve 204 y aplica baja lógica (estado → inactivo)', async () => {
    const clienteActivo = {
      ...clienteEjemplo,
      update: vi.fn().mockResolvedValue(undefined),
    };
    Cliente.findByPk.mockResolvedValue(clienteActivo);

    const res = await request(app)
      .delete('/api/clientes/1')
      .set('Authorization', tokenValido());

    expect(res.status).toBe(204);
    expect(clienteActivo.update).toHaveBeenCalledWith({ estado: 'inactivo' });
  });

  it('devuelve 404 si el cliente a eliminar no existe', async () => {
    Cliente.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/clientes/999')
      .set('Authorization', tokenValido());

    expect(res.status).toBe(404);
  });
});
