// Pure helpers for the daily watch of official sources (tested in lib.test.ts).
import { createHash } from 'node:crypto';

export type Extracao =
  /** Text between two markers of the raw HTML (e.g. the content area of a gov.br page). */
  | { tipo: 'trecho'; inicio: string; fim: string }
  /** The whole <body> (e.g. a law published as a single document). */
  | { tipo: 'corpo' }
  /** Only the sentences mentioning one of the keywords (news pages that change every day). */
  | { tipo: 'palavras'; palavras: string[]; inicio?: string; fim?: string };

export type Fonte = {
  id: string;
  titulo: string;
  url: string;
  /** Rule ids (src/data/regras) that depend on this source. */
  regras: string[];
  extracao: Extracao;
};

export type EstadoFonte = { hash: string; conferidoEm: string };

const ENTIDADES: Record<string, string> = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", ordm: 'º', ordf: 'ª', sect: '§' };

export function decodificarEntidades(texto: string): string {
  return texto
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (inteira, nome: string) => ENTIDADES[nome.toLowerCase()] ?? inteira);
}

/** HTML → plain text, one block per line, whitespace normalized (so cosmetic changes don't trigger alerts). */
export function htmlParaTexto(html: string): string {
  return decodificarEntidades(
    html
      .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<(br|\/p|\/div|\/li|\/tr|\/h\d|\/item|\/title)[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/[ \t ]+/g, ' ')
    .split('\n')
    .map((linha) => linha.trim())
    .filter(Boolean)
    .join('\n');
}

function recortar(html: string, inicio?: string, fim?: string): string {
  let trecho = html;
  if (inicio) {
    const i = trecho.indexOf(inicio);
    if (i === -1) throw new Error(`Start marker not found: ${inicio}`);
    trecho = trecho.slice(i + inicio.length);
  }
  if (fim) {
    const j = trecho.indexOf(fim);
    if (j === -1) throw new Error(`End marker not found: ${fim}`);
    trecho = trecho.slice(0, j);
  }
  // Markers usually sit inside a tag: drop the cut tag fragments at both ends.
  return trecho.replace(/^[^<]*?>/, '').replace(/<[^>]*$/, '');
}

export function extrairTexto(html: string, extracao: Extracao): string {
  if (extracao.tipo === 'trecho') return htmlParaTexto(recortar(html, extracao.inicio, extracao.fim));
  if (extracao.tipo === 'corpo') {
    const corpo = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
    return htmlParaTexto(corpo ? corpo[1] : html);
  }
  const texto = htmlParaTexto(recortar(html, extracao.inicio, extracao.fim));
  const palavras = extracao.palavras.map((p) => p.toLowerCase());
  const frases = texto
    .split(/\n|(?<=[.!?])\s+/)
    .map((f) => f.trim())
    .filter((f) => palavras.some((p) => f.toLowerCase().includes(p)));
  return [...new Set(frases)].sort().join('\n');
}

export function hashTexto(texto: string): string {
  return createHash('sha256').update(texto).digest('hex');
}

/** Lines removed and added between two texts (order-insensitive, enough to see what changed). */
export function diferencas(antes: string, depois: string, limite = 15) {
  const a = new Set(antes.split('\n'));
  const d = new Set(depois.split('\n'));
  return {
    removidas: [...a].filter((l) => !d.has(l)).slice(0, limite),
    adicionadas: [...d].filter((l) => !a.has(l)).slice(0, limite),
  };
}

// --- Rule freshness (reads the same JSON files as the site) ---

type Versao = { vigenteDesde: string; vigenteAte?: string; situacao: string; verificadoEm: string };
export type Regra = { id: string; titulo: string; versoes: Versao[] };

export const DIAS_ALERTA_SITE = 45;
export const DIAS_AVISO_ANTECIPADO = 30;

export function diasEntre(de: string, ate: string): number {
  return Math.round((Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / 86_400_000);
}

export type Lembrete = { nivel: 'urgente' | 'aviso' | 'info'; regra: string; mensagem: string };

/** Reminders for the human: checks about to expire, scheduled changes, proposed values close to their date. */
export function lembretesDasRegras(regras: Regra[], hoje: string): Lembrete[] {
  const lembretes: Lembrete[] = [];
  for (const regra of regras) {
    const ordenadas = [...regra.versoes].sort((x, y) => x.vigenteDesde.localeCompare(y.vigenteDesde));
    const iniciadas = ordenadas.filter((v) => v.vigenteDesde <= hoje);
    const vigente = [...iniciadas].reverse().find((v) => !v.vigenteAte || hoje <= v.vigenteAte);

    if (!vigente && iniciadas.length > 0) {
      lembretes.push({ nivel: 'urgente', regra: regra.id, mensagem: `Nenhuma versão em vigor hoje: o site mostra o aviso de valores desatualizados.` });
    }
    const atual = vigente ?? iniciadas.at(-1);
    if (atual) {
      const idade = diasEntre(atual.verificadoEm, hoje);
      if (idade > DIAS_ALERTA_SITE) {
        lembretes.push({ nivel: 'urgente', regra: regra.id, mensagem: `Verificada há ${idade} dias: o site já mostra o aviso. Confira as fontes e atualize "verificadoEm".` });
      } else if (idade > DIAS_ALERTA_SITE - 15) {
        lembretes.push({ nivel: 'aviso', regra: regra.id, mensagem: `Verificada há ${idade} dias: o aviso aparece no site em ${DIAS_ALERTA_SITE - idade} dias.` });
      }
      if (atual.vigenteAte) {
        const restantes = diasEntre(hoje, atual.vigenteAte);
        const temSucessora = ordenadas.some((v) => v.vigenteDesde > atual.vigenteAte!);
        if (!temSucessora && restantes <= DIAS_AVISO_ANTECIPADO) {
          lembretes.push({ nivel: 'urgente', regra: regra.id, mensagem: `A versão em vigor termina em ${restantes} dias e não há versão seguinte cadastrada.` });
        }
      }
    }
    for (const futura of ordenadas.filter((v) => v.vigenteDesde > hoje)) {
      const faltam = diasEntre(hoje, futura.vigenteDesde);
      if (faltam > DIAS_AVISO_ANTECIPADO) continue;
      if (futura.situacao === 'proposta') {
        lembretes.push({ nivel: 'urgente', regra: regra.id, mensagem: `Valor ainda "proposta" entra em vigor em ${faltam} dias: confirme o valor oficial.` });
      } else {
        lembretes.push({ nivel: 'info', regra: regra.id, mensagem: `Mudança programada em ${faltam} dias (${futura.vigenteDesde}).` });
      }
    }
  }
  const ordem = { urgente: 0, aviso: 1, info: 2 };
  return lembretes.sort((x, y) => ordem[x.nivel] - ordem[y.nivel]);
}
