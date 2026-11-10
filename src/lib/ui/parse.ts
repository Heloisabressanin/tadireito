/**
 * Parses an amount typed by a Brazilian user: "3.500,00", "3500", "3500,5", "R$ 1.621" or "3500.50".
 * Returns null when the text is not a valid non-negative amount.
 */
export function parseReais(texto: string): number | null {
  const limpo = texto.replace(/R\$|\s/g, '');
  if (limpo === '') return null;
  if (!/^[\d.,]+$/.test(limpo)) return null;

  let normalizado: string;
  if (limpo.includes(',')) {
    // Comma is the decimal separator; dots are thousands separators.
    if (limpo.indexOf(',') !== limpo.lastIndexOf(',')) return null;
    normalizado = limpo.replace(/\./g, '').replace(',', '.');
  } else {
    const partes = limpo.split('.');
    // "3500.50" (one dot, 1-2 decimals) is a decimal; "1.621" or "1.234.567" are thousands.
    const pareceDecimal = partes.length === 2 && partes[1].length > 0 && partes[1].length <= 2;
    normalizado = pareceDecimal ? limpo : partes.join('');
  }

  const valor = Number(normalizado);
  return Number.isFinite(valor) && valor >= 0 ? valor : null;
}

/** "3.500,00" — the input display format (no currency symbol). */
export function formatarCampoReais(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Parses a non-negative integer (hours, days, dependents). */
export function parseInteiro(texto: string): number | null {
  const limpo = texto.trim();
  if (!/^\d+$/.test(limpo)) return null;
  return Number(limpo);
}

/** Parses hours that may have decimals ("10", "7,5", "7.5"). */
export function parseHoras(texto: string): number | null {
  const limpo = texto.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(limpo)) return null;
  return Number(limpo);
}
