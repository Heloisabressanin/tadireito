import { describe, expect, it } from 'vitest';
import { formatarCampoReais, parseHoras, parseInteiro, parseReais } from './parse';

describe('parseReais', () => {
  it.each([
    ['3.500,00', 3500],
    ['3500', 3500],
    ['3500,5', 3500.5],
    ['R$ 1.621', 1621],
    ['1.234.567,89', 1234567.89],
    ['3500.50', 3500.5],
    ['0', 0],
  ])('parses %s', (texto, esperado) => {
    expect(parseReais(texto)).toBe(esperado);
  });

  it.each(['', 'abc', '-100', '1,2,3', '12a'])('rejects %s', (texto) => {
    expect(parseReais(texto)).toBeNull();
  });
});

describe('other parsers', () => {
  it('formats the input value', () => {
    expect(formatarCampoReais(3500)).toBe('3.500,00');
  });

  it('parses integers and hours', () => {
    expect(parseInteiro('2')).toBe(2);
    expect(parseInteiro('2.5')).toBeNull();
    expect(parseHoras('7,5')).toBe(7.5);
    expect(parseHoras('10')).toBe(10);
    expect(parseHoras('-1')).toBeNull();
  });
});
