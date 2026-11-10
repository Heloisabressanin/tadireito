// Daily watch of the official sources behind our rules.
//
//   node scripts/veille/veille.mts                     check every source, print a Markdown report
//   node scripts/veille/veille.mts --relatorio r.md    also write the report to a file (used by GitHub Actions)
//   node scripts/veille/veille.mts --aceitar [id…]     after a human review: record the current content as the new reference
//   node scripts/veille/veille.mts --marcar-verificadas monthly routine: set "verificadoEm" to today on current and future
//                                                       rule versions; refused if any source changed or could not be checked
//
// Exit codes: 0 = nothing to do, 2 = something needs a human (changed source or urgent reminder), 1 = crash.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { diferencas, extrairTexto, hashTexto, lembretesDasRegras, type EstadoFonte, type Fonte, type Regra } from './lib.mts';

const pasta = dirname(fileURLToPath(import.meta.url));
const raiz = join(pasta, '..', '..');
const arquivoEstado = join(pasta, 'estado.json');
const pastaInstantaneos = join(pasta, 'instantaneos');
const USER_AGENT = 'Mozilla/5.0 (compatible; TaDireitoVeille/1.0; +https://tadireito.com/sobre)';

function hojeEmBrasilia() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

async function lerJson<T>(arquivo: string, padrao: T): Promise<T> {
  try {
    return JSON.parse(await readFile(arquivo, 'utf8')) as T;
  } catch {
    return padrao;
  }
}

async function baixar(url: string): Promise<string> {
  const resposta = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(30_000) });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  const html = await resposta.text();
  if (/Acesso Negado/i.test(html.slice(0, 2000))) throw new Error('Blocked by the site ("Acesso Negado")');
  return html;
}

const pastaRegras = join(raiz, 'src', 'data', 'regras');

async function arquivosDeRegras() {
  return (await readdir(pastaRegras)).filter((a) => a.endsWith('.json')).map((a) => join(pastaRegras, a));
}

async function carregarRegras(): Promise<Regra[]> {
  return Promise.all((await arquivosDeRegras()).map(async (a) => JSON.parse(await readFile(a, 'utf8')) as Regra));
}

/** Marks every version still in force or scheduled as checked today. Past versions keep their history. */
async function marcarVerificadas(hoje: string) {
  for (const arquivo of await arquivosDeRegras()) {
    const regra = JSON.parse(await readFile(arquivo, 'utf8')) as Regra;
    let marcadas = 0;
    for (const versao of regra.versoes) {
      if (!versao.vigenteAte || versao.vigenteAte >= hoje) {
        versao.verificadoEm = hoje;
        marcadas++;
      }
    }
    await writeFile(arquivo, `${JSON.stringify(regra, null, 2)}\n`);
    console.log(`✓ ${regra.id}: ${marcadas} versão(ões) marcada(s) como verificada(s) em ${hoje}`);
  }
}

type Resultado =
  | { fonte: Fonte; status: 'igual' }
  | { fonte: Fonte; status: 'nova' | 'mudou'; hash: string; texto: string; antes?: string }
  | { fonte: Fonte; status: 'erro'; erro: string };

async function verificar(fonte: Fonte, estado: Record<string, EstadoFonte>): Promise<Resultado> {
  try {
    const texto = extrairTexto(await baixar(fonte.url), fonte.extracao);
    // Keyword sources may legitimately match nothing today; full-page sources should never be empty.
    if (fonte.extracao.tipo !== 'palavras' && texto.length < 20) {
      throw new Error('Extracted text is almost empty: the page layout probably changed');
    }
    const hash = hashTexto(texto);
    const anterior = estado[fonte.id];
    if (!anterior) return { fonte, status: 'nova', hash, texto };
    if (anterior.hash === hash) return { fonte, status: 'igual' };
    const antes = await readFile(join(pastaInstantaneos, `${fonte.id}.txt`), 'utf8').catch(() => undefined);
    return { fonte, status: 'mudou', hash, texto, antes };
  } catch (erro) {
    return { fonte, status: 'erro', erro: erro instanceof Error ? erro.message : String(erro) };
  }
}

function relatorio(resultados: Resultado[], lembretes: ReturnType<typeof lembretesDasRegras>, hoje: string) {
  const linhas = [`# Veille des lois — ${hoje}`, ''];
  const mudaram = resultados.filter((r) => r.status === 'mudou' || r.status === 'nova');
  const erros = resultados.filter((r) => r.status === 'erro');

  linhas.push(`**${mudaram.length}** source(s) modifiée(s) · **${erros.length}** erreur(s) · **${lembretes.filter((l) => l.nivel === 'urgente').length}** rappel(s) urgent(s)`, '');

  if (mudaram.length > 0) {
    linhas.push('## Sources modifiées', '');
    for (const r of mudaram) {
      if (r.status !== 'mudou' && r.status !== 'nova') continue;
      linhas.push(`### ${r.fonte.titulo}`, `- Lien : ${r.fonte.url}`, `- Règles concernées : \`${r.fonte.regras.join('`, `')}\``);
      if (r.status === 'nova') {
        linhas.push('- Première vérification : aucune référence enregistrée.');
      } else if (r.antes !== undefined) {
        const { removidas, adicionadas } = diferencas(r.antes, r.texto);
        linhas.push('', '```diff', ...removidas.map((l) => `- ${l}`), ...adicionadas.map((l) => `+ ${l}`), '```');
      }
      linhas.push('');
    }
    linhas.push(
      '**À faire :** lire les changements, mettre à jour `src/data/regras/*.json` si un barème a changé (nouvelle version datée + source + `verificadoEm`), puis lancer `pnpm veille:aceitar` et commiter.',
      '',
    );
  }
  if (erros.length > 0) {
    linhas.push('## Sources inaccessibles', '');
    for (const r of erros) if (r.status === 'erro') linhas.push(`- **${r.fonte.titulo}** : ${r.erro} (${r.fonte.url})`);
    linhas.push('');
  }
  if (lembretes.length > 0) {
    linhas.push('## Rappels sur les barèmes', '');
    const icone = { urgente: '🔴', aviso: '🟡', info: '🔵' };
    for (const l of lembretes) linhas.push(`- ${icone[l.nivel]} \`${l.regra}\` : ${l.mensagem}`);
    linhas.push('');
  }
  if (mudaram.length === 0 && erros.length === 0 && lembretes.length === 0) linhas.push('Rien à signaler ✅');
  return linhas.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const fontes = JSON.parse(await readFile(join(pasta, 'fontes.json'), 'utf8')) as Fonte[];
  const estado = await lerJson<Record<string, EstadoFonte>>(arquivoEstado, {});
  const hoje = hojeEmBrasilia();

  const iAceitar = args.indexOf('--aceitar');
  const selecionadas = iAceitar === -1 ? fontes : fontes.filter((f) => args.slice(iAceitar + 1).length === 0 || args.slice(iAceitar + 1).includes(f.id));
  const resultados = await Promise.all(selecionadas.map((f) => verificar(f, estado)));

  if (iAceitar !== -1) {
    await mkdir(pastaInstantaneos, { recursive: true });
    for (const r of resultados) {
      if (r.status === 'erro') {
        console.error(`✗ ${r.fonte.id}: ${r.erro}`);
        continue;
      }
      if (r.status !== 'igual') {
        await writeFile(join(pastaInstantaneos, `${r.fonte.id}.txt`), r.texto);
        estado[r.fonte.id] = { hash: r.hash, conferidoEm: hoje };
      } else {
        estado[r.fonte.id] = { ...estado[r.fonte.id], conferidoEm: hoje };
      }
      console.log(`✓ ${r.fonte.id} (${r.status === 'igual' ? 'inchangée' : 'nouvelle référence'})`);
    }
    await writeFile(arquivoEstado, `${JSON.stringify(estado, null, 2)}\n`);
    return;
  }

  if (args.includes('--marcar-verificadas')) {
    const pendentes = resultados.filter((r) => r.status !== 'igual');
    if (pendentes.length > 0) {
      console.error('Recusado: estas fontes mudaram ou não puderam ser verificadas. Revise-as antes (ver o relatório normal):');
      for (const r of pendentes) console.error(`  - ${r.fonte.id} (${r.status})`);
      process.exitCode = 2;
      return;
    }
    await marcarVerificadas(hoje);
    return;
  }

  const lembretes = lembretesDasRegras(await carregarRegras(), hoje);
  const texto = relatorio(resultados, lembretes, hoje);
  console.log(texto);
  const iRelatorio = args.indexOf('--relatorio');
  if (iRelatorio !== -1 && args[iRelatorio + 1]) await writeFile(args[iRelatorio + 1], texto);

  const precisaDeHumano = resultados.some((r) => r.status === 'mudou' || r.status === 'nova') || lembretes.some((l) => l.nivel === 'urgente');
  process.exitCode = precisaDeHumano ? 2 : 0;
}

main().catch((erro) => {
  console.error(erro);
  process.exitCode = 1;
});
