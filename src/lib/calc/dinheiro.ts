/**
 * Rounds to the cent, half up, without binary floating-point surprises
 * (1621 × 0.075 is 121.57499999… in floating point but must give 121.58).
 */
export function arredondar(valor: number): number {
  if (!Number.isFinite(valor)) throw new Error(`Cannot round ${valor}`);
  const limpo = Number(valor.toFixed(10));
  if (Math.abs(limpo) < 1e-6) return 0;
  const sinal = Math.sign(limpo);
  return (sinal * Math.round(Number(`${Math.abs(limpo)}e2`))) / 100;
}

/**
 * Rounds each part and fixes the last one so the parts add up exactly to `total`
 * (avoids showing brackets whose sum is one cent off the displayed total).
 */
export function distribuirArredondamento(partes: number[], total: number): number[] {
  if (partes.length === 0) return [];
  const arredondadas = partes.map(arredondar);
  const semUltima = arredondadas.slice(0, -1).reduce((soma, v) => soma + v, 0);
  arredondadas[arredondadas.length - 1] = arredondar(total - semUltima);
  return arredondadas;
}

const formatador = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** "R$ 3.191,40" (with a normal space, safe to copy into WhatsApp). */
export function formatarReais(valor: number): string {
  return formatador.format(valor).replace(/\u00a0/g, ' ');
}

/** "7,5%" */
export function formatarPercentual(aliquota: number): string {
  return `${(aliquota * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
}
