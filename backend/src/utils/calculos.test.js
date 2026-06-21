import { describe, it, expect } from 'vitest';
import {
  calcularDiasAlquiler,
  calcularMontoAlquiler,
  calcularTotalVenta,
  normalizarPaginacion,
} from './calculos.js';

describe('calcularDiasAlquiler', () => {
  it('calcula correctamente para 3 días', () => {
    const inicio = new Date('2024-01-01T00:00:00Z');
    const fin = new Date('2024-01-04T00:00:00Z');
    expect(calcularDiasAlquiler(inicio, fin)).toBe(3);
  });

  it('retorna 1 día mínimo cuando inicio y fin son la misma fecha', () => {
    const fecha = new Date('2024-01-01T00:00:00Z');
    expect(calcularDiasAlquiler(fecha, fecha)).toBe(1);
  });

  it('retorna 1 día mínimo cuando la fecha de fin es anterior a la de inicio', () => {
    const inicio = new Date('2024-01-05T00:00:00Z');
    const fin = new Date('2024-01-01T00:00:00Z');
    expect(calcularDiasAlquiler(inicio, fin)).toBe(1);
  });

  it('calcula correctamente para exactamente 1 día', () => {
    const inicio = new Date('2024-03-10T00:00:00Z');
    const fin = new Date('2024-03-11T00:00:00Z');
    expect(calcularDiasAlquiler(inicio, fin)).toBe(1);
  });

  it('acepta strings de fecha como parámetros', () => {
    expect(calcularDiasAlquiler('2024-06-01', '2024-06-08')).toBe(7);
  });
});

describe('calcularMontoAlquiler', () => {
  it('calcula el monto multiplicando días por precio', () => {
    expect(calcularMontoAlquiler(3, '150.00')).toBe(450);
  });

  it('maneja precios con decimales', () => {
    expect(calcularMontoAlquiler(2, '199.50')).toBeCloseTo(399);
  });

  it('calcula correctamente para 1 día', () => {
    expect(calcularMontoAlquiler(1, '300')).toBe(300);
  });
});

describe('calcularTotalVenta', () => {
  it('suma precio_unitario × cantidad de múltiples items', () => {
    const items = [
      { precio_unitario: '100.00', cantidad: 2 },
      { precio_unitario: '50.00', cantidad: 3 },
    ];
    expect(calcularTotalVenta(items)).toBe(350);
  });

  it('retorna 0 para lista vacía', () => {
    expect(calcularTotalVenta([])).toBe(0);
  });

  it('funciona correctamente con un solo item', () => {
    expect(calcularTotalVenta([{ precio_unitario: '299.99', cantidad: 1 }])).toBeCloseTo(299.99);
  });

  it('acumula correctamente cantidades mayores a 1', () => {
    expect(calcularTotalVenta([{ precio_unitario: '50.00', cantidad: 4 }])).toBe(200);
  });
});

describe('normalizarPaginacion', () => {
  it('calcula offset correctamente para página 2', () => {
    expect(normalizarPaginacion(2, 10)).toEqual({ limit: 10, pg: 2, offset: 10 });
  });

  it('clampea limite a 1 si viene un número negativo', () => {
    expect(normalizarPaginacion(1, -5).limit).toBe(1);
  });

  it('usa el default 10 cuando limite es 0 (valor falsy)', () => {
    expect(normalizarPaginacion(1, 0).limit).toBe(10);
  });

  it('clampea limite a 100 si supera el máximo permitido', () => {
    expect(normalizarPaginacion(1, 500).limit).toBe(100);
  });

  it('usa valores por defecto ante entradas inválidas', () => {
    const result = normalizarPaginacion('abc', 'xyz');
    expect(result.limit).toBe(10);
    expect(result.pg).toBe(1);
    expect(result.offset).toBe(0);
  });

  it('página 1 siempre tiene offset 0', () => {
    expect(normalizarPaginacion(1, 20).offset).toBe(0);
  });
});
