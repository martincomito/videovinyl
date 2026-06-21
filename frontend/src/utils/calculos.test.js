import { describe, it, expect } from 'vitest';
import { calcularAlquiler, calcularDiasRetraso, calcularTotalVenta } from './calculos.js';

describe('calcularAlquiler', () => {
  it('retorna null si falta la fecha de devolución', () => {
    expect(calcularAlquiler(null, '150')).toBeNull();
  });

  it('retorna null si falta el precio', () => {
    expect(calcularAlquiler('2024-12-31', null)).toBeNull();
  });

  it('retorna mínimo 1 día aunque la devolución sea hoy', () => {
    const ahora = new Date('2024-06-15T10:00:00');
    const resultado = calcularAlquiler('2024-06-15', '100', ahora);
    expect(resultado.dias).toBe(1);
    expect(resultado.total).toBe(100);
  });

  it('calcula correctamente para 3 días', () => {
    const ahora = new Date('2024-06-01T00:00:00');
    const resultado = calcularAlquiler('2024-06-04', '200', ahora);
    expect(resultado.dias).toBe(3);
    expect(resultado.total).toBe(600);
  });

  it('maneja precios como string decimal', () => {
    const ahora = new Date('2024-06-01T00:00:00');
    const resultado = calcularAlquiler('2024-06-03', '150.50', ahora);
    expect(resultado.total).toBeCloseTo(301);
  });
});

describe('calcularDiasRetraso', () => {
  it('retorna 0 si no se pasa fecha', () => {
    expect(calcularDiasRetraso(null)).toBe(0);
  });

  it('retorna 0 si la devolución esperada es en el futuro', () => {
    const maniana = new Date();
    maniana.setDate(maniana.getDate() + 1);
    expect(calcularDiasRetraso(maniana.toISOString())).toBe(0);
  });

  it('retorna 1 día de retraso para fecha de ayer', () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    expect(calcularDiasRetraso(ayer.toISOString())).toBe(1);
  });

  it('retorna días correctos para una fecha varios días atrás', () => {
    const ahora = new Date('2024-06-15T08:00:00');
    const esperada = new Date('2024-06-10T00:00:00');
    expect(calcularDiasRetraso(esperada.toISOString(), ahora)).toBe(5);
  });

  it('nunca retorna un número negativo', () => {
    const futuro = new Date();
    futuro.setFullYear(futuro.getFullYear() + 1);
    expect(calcularDiasRetraso(futuro.toISOString())).toBeGreaterThanOrEqual(0);
  });
});

describe('calcularTotalVenta', () => {
  it('suma precio × cantidad de múltiples items', () => {
    const items = [
      { precio: 100, cantidad: 2 },
      { precio: 50, cantidad: 3 },
    ];
    expect(calcularTotalVenta(items)).toBe(350);
  });

  it('retorna 0 para lista vacía', () => {
    expect(calcularTotalVenta([])).toBe(0);
  });

  it('funciona con un solo item', () => {
    expect(calcularTotalVenta([{ precio: 299, cantidad: 1 }])).toBe(299);
  });

  it('acumula correctamente cantidades mayores a 1', () => {
    expect(calcularTotalVenta([{ precio: 75, cantidad: 4 }])).toBe(300);
  });
});
