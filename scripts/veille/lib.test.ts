import { describe, expect, it } from 'vitest';
import { diferencas, extrairTexto, hashTexto, htmlParaTexto, lembretesDasRegras, type Regra } from './lib.mts';

describe('htmlParaTexto', () => {
  it('drops scripts, styles and tags, decodes entities and normalizes spaces', () => {
    const html = '<p>Até R$&nbsp;1.621,00 &#8211; 7,5%</p><script>var x=1</script><style>p{}</style><div>  De   R$ 1.621,01 </div>';
    expect(htmlParaTexto(html)).toBe('Até R$ 1.621,00 – 7,5%\nDe R$ 1.621,01');
  });

  it('is insensitive to cosmetic whitespace changes', () => {
    expect(hashTexto(htmlParaTexto('<p>Alíquota  9%</p>'))).toBe(hashTexto(htmlParaTexto('<p>\n  Alíquota 9%\n</p>')));
  });
});

describe('extrairTexto', () => {
  const pagina = '<header>Menu 28/10</header><div id="content-core">Tabela 2026: 7,5%</div><div id="viewlet-below-content">Compartilhe</div>';

  it('keeps only the content between markers', () => {
    expect(extrairTexto(pagina, { tipo: 'trecho', inicio: 'id="content-core"', fim: 'id="viewlet-below-content"' })).toBe('Tabela 2026: 7,5%');
  });

  it('fails loudly when the page layout changed', () => {
    expect(() => extrairTexto(pagina, { tipo: 'trecho', inicio: 'id="nao-existe"', fim: 'x' })).toThrow(/marker/);
  });

  it('keeps only sentences with keywords, ignoring unrelated news', () => {
    const noticias = '<item><title>MTE publica portaria da jornada 5x2</title></item><item><title>Feira de empregos em SP</title></item>';
    expect(extrairTexto(noticias, { tipo: 'palavras', palavras: ['5x2', 'divisor'] })).toBe('MTE publica portaria da jornada 5x2');
  });
});

describe('diferencas', () => {
  it('lists removed and added lines', () => {
    expect(diferencas('a\nb\nc', 'a\nc\nd')).toEqual({ removidas: ['b'], adicionadas: ['d'] });
  });
});

describe('lembretesDasRegras', () => {
  const v = (vigenteDesde: string, extra: Partial<Regra['versoes'][number]> = {}) => ({ vigenteDesde, situacao: 'lei', verificadoEm: '2026-10-28', ...extra });

  it('warns before the site banner appears, then flags it as urgent', () => {
    const regras: Regra[] = [{ id: 'inss', titulo: 'INSS', versoes: [v('2026-01-01')] }];
    expect(lembretesDasRegras(regras, '2026-11-20')).toEqual([]);
    expect(lembretesDasRegras(regras, '2026-12-05')[0]).toMatchObject({ nivel: 'aviso' });
    expect(lembretesDasRegras(regras, '2026-12-20')[0]).toMatchObject({ nivel: 'urgente' });
  });

  it('flags a version ending soon without a successor', () => {
    const regras: Regra[] = [{ id: 'inss', titulo: 'INSS', versoes: [v('2026-01-01', { vigenteAte: '2026-12-31' })] }];
    expect(lembretesDasRegras(regras, '2026-12-10').map((l) => l.mensagem).join()).toMatch(/não há versão seguinte/);
  });

  it('asks to confirm a proposed value close to its start date and announces scheduled changes', () => {
    const regras: Regra[] = [
      { id: 'minimo', titulo: 'Mínimo', versoes: [v('2026-01-01', { vigenteAte: '2026-12-31' }), v('2027-01-01', { situacao: 'proposta' })] },
      { id: 'jornada', titulo: 'Jornada', versoes: [v('1988-10-05', { vigenteAte: '2026-12-15' }), v('2026-12-16')] },
    ];
    const lembretes = lembretesDasRegras(regras, '2026-12-05');
    expect(lembretes.find((l) => l.regra === 'minimo')).toMatchObject({ nivel: 'urgente' });
    expect(lembretes.find((l) => l.regra === 'jornada' && l.nivel === 'info')?.mensagem).toMatch(/11 dias/);
  });
});
