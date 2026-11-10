import { describe, expect, it } from 'vitest';
import { arredondar, distribuirArredondamento, formatarPercentual, formatarReais } from './dinheiro';

describe('arredondar', () => {
  it('rounds half up despite floating-point representation', () => {
    expect(1621 * 0.075).not.toBe(121.575);
    expect(arredondar(1621 * 0.075)).toBe(121.58);
    expect(arredondar(1.005)).toBe(1.01);
    expect(arredondar(2.675)).toBe(2.68);
  });

  it('handles zero, tiny and negative values', () => {
    expect(arredondar(0)).toBe(0);
    expect(arredondar(1e-9)).toBe(0);
    expect(arredondar(-1.005)).toBe(-1.01);
  });

  it('rejects non-finite values', () => {
    expect(() => arredondar(Number.NaN)).toThrow();
  });
});

describe('distribuirArredondamento', () => {
  it('makes the rounded parts add up to the total', () => {
    const partes = [121.575, 115.3656, 71.6592];
    const total = arredondar(partes.reduce((a, b) => a + b));
    const distribuidas = distribuirArredondamento(partes, total);
    expect(total).toBe(308.6);
    expect(arredondar(distribuidas.reduce((a, b) => a + b))).toBe(total);
  });
});

describe('formatting', () => {
  it('formats Brazilian reais with a plain space', () => {
    expect(formatarReais(3191.4)).toBe('R$ 3.191,40');
  });

  it('formats rates', () => {
    expect(formatarPercentual(0.075)).toBe('7,5%');
    expect(formatarPercentual(0.275)).toBe('27,5%');
  });
});
