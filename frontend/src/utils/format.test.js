import { describe, it, expect } from 'vitest';
import { formatearFechaHora, formatearMonto } from './format.js';

describe('formatearFechaHora', () => {
  it('retorna cadena vacía para null', () => {
    expect(formatearFechaHora(null)).toBe('');
  });

  it('retorna cadena vacía para undefined', () => {
    expect(formatearFechaHora(undefined)).toBe('');
  });

  it('produce una cadena con el formato dd-mm-yyyy hh:mm', () => {
    const resultado = formatearFechaHora('2024-06-15T10:30:00.000');
    expect(resultado).toMatch(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/);
  });

  it('extrae correctamente el año', () => {
    const resultado = formatearFechaHora('2024-06-15T10:30:00.000');
    expect(resultado).toContain('2024');
  });
});

describe('formatearMonto', () => {
  it('retorna "-" para null', () => {
    expect(formatearMonto(null)).toBe('-');
  });

  it('retorna "-" para undefined', () => {
    expect(formatearMonto(undefined)).toBe('-');
  });

  it('incluye el símbolo $ en el resultado', () => {
    expect(formatearMonto(1000)).toContain('$');
  });

  it('formatea el valor 0 correctamente', () => {
    const resultado = formatearMonto(0);
    expect(resultado).toContain('$');
    expect(resultado).toContain('0');
  });

  it('formatea un string numérico igual que un número', () => {
    expect(formatearMonto('500')).toBe(formatearMonto(500));
  });
});
