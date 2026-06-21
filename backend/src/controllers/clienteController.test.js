import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAll, getById, create, update, remove } from './clienteController.js';
import { Cliente } from '../models/index.js';

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

// Helpers
function mockReq(overrides = {}) {
  return { params: {}, query: {}, body: {}, ...overrides };
}

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
}

const clienteBase = {
  id: 1,
  nombre: 'Juan',
  apellido: 'García',
  dni: '12345678',
  telefono: '1122334455',
  email: 'juan@test.com',
  estado: 'activo',
};

describe('clienteController – getAll', () => {
  beforeEach(() => {
    Cliente.findAndCountAll.mockResolvedValue({ count: 2, rows: [clienteBase] });
  });

  it('responde con la estructura correcta de paginación', async () => {
    const req = mockReq({ query: { pagina: '1', limite: '10' } });
    const res = mockRes();
    await getAll(req, res, vi.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        datos: expect.any(Array),
        total: 2,
        pagina: 1,
        totalPaginas: 1,
      })
    );
  });

  it('aplica paginación correctamente (offset y limit)', async () => {
    const req = mockReq({ query: { pagina: '2', limite: '5' } });
    const res = mockRes();
    await getAll(req, res, vi.fn());

    expect(Cliente.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 5, offset: 5 })
    );
  });

  it('llama a next() cuando el modelo lanza un error', async () => {
    Cliente.findAndCountAll.mockRejectedValue(new Error('DB error'));
    const next = vi.fn();
    await getAll(mockReq(), mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('clienteController – getById', () => {
  it('devuelve el cliente cuando existe', async () => {
    Cliente.findByPk.mockResolvedValue(clienteBase);
    const req = mockReq({ params: { id: '1' } });
    const res = mockRes();
    await getById(req, res, vi.fn());

    expect(res.json).toHaveBeenCalledWith(clienteBase);
  });

  it('responde 404 cuando el cliente no existe', async () => {
    Cliente.findByPk.mockResolvedValue(null);
    const req = mockReq({ params: { id: '999' } });
    const res = mockRes();
    await getById(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cliente no encontrado' });
  });
});

describe('clienteController – create', () => {
  it('crea un cliente y responde con 201', async () => {
    Cliente.create.mockResolvedValue(clienteBase);
    const req = mockReq({
      body: {
        nombre: 'Juan', apellido: 'García', dni: '12345678',
        telefono: '1122334455', email: 'juan@test.com', estado: 'activo',
      },
    });
    const res = mockRes();
    await create(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(clienteBase);
  });

  it('llama a next() cuando falla la creación', async () => {
    Cliente.create.mockRejectedValue(new Error('Unique constraint'));
    const next = vi.fn();
    await create(mockReq({ body: {} }), mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('clienteController – update', () => {
  const clienteConUpdate = {
    ...clienteBase,
    update: vi.fn(),
  };

  beforeEach(() => {
    clienteConUpdate.update.mockResolvedValue({ ...clienteBase, nombre: 'Carlos' });
  });

  it('actualiza los datos del cliente y responde con el resultado', async () => {
    Cliente.findByPk.mockResolvedValue(clienteConUpdate);
    const req = mockReq({
      params: { id: '1' },
      body: { nombre: 'Carlos', apellido: 'García', dni: '12345678',
              telefono: '1122334455', email: 'juan@test.com', estado: 'activo' },
    });
    const res = mockRes();
    await update(req, res, vi.fn());

    expect(clienteConUpdate.update).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it('responde 404 si el cliente a actualizar no existe', async () => {
    Cliente.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await update(mockReq({ params: { id: '999' }, body: {} }), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('clienteController – remove (baja lógica)', () => {
  const clienteConUpdate = {
    ...clienteBase,
    update: vi.fn().mockResolvedValue(undefined),
  };

  it('marca al cliente como inactivo en lugar de eliminarlo', async () => {
    Cliente.findByPk.mockResolvedValue(clienteConUpdate);
    const req = mockReq({ params: { id: '1' } });
    const res = mockRes();
    await remove(req, res, vi.fn());

    expect(clienteConUpdate.update).toHaveBeenCalledWith({ estado: 'inactivo' });
  });

  it('responde con 204 al dar de baja exitosamente', async () => {
    Cliente.findByPk.mockResolvedValue(clienteConUpdate);
    const res = mockRes();
    await remove(mockReq({ params: { id: '1' } }), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('responde 404 si el cliente a eliminar no existe', async () => {
    Cliente.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await remove(mockReq({ params: { id: '999' } }), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
