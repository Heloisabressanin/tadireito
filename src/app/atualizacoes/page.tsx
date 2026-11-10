import type { Metadata } from 'next';
import { PaginaTexto } from '@/components/pagina-texto';
import { EtiquetaVigencia } from '@/features/etiqueta-vigencia';
import { todasAsRegras } from '@/lib/regras/catalogo';
import { formatDateBr } from '@/lib/regras/dates';
import { metadadosPagina } from '@/lib/metadados';

export const metadata: Metadata = metadadosPagina({
  titulo: 'Atualizações da lei',
  descricao:
    'Todas as mudanças de lei que usamos nas calculadoras, com datas, fontes oficiais e a data da nossa última verificação.',
  caminho: '/atualizacoes',
});

const SITUACAO = { lei: 'Lei publicada', proposta: 'Valor previsto', interpretacao: 'Valor estimado' } as const;

export default function AtualizacoesPage() {
  const mudancas = todasAsRegras
    .flatMap((regra) => regra.versoes.map((versao) => ({ regra, versao })))
    .filter(({ versao }) => versao.vigenteDesde >= '2026-01-01')
    .sort((a, b) => b.versao.vigenteDesde.localeCompare(a.versao.vigenteDesde) || a.regra.titulo.localeCompare(b.regra.titulo));

  return (
    <PaginaTexto chamada="Transparência" titulo="Atualizações da lei">
      <p>Tudo o que mudou ou vai mudar nas nossas calculadoras, com a fonte oficial de cada valor.</p>
      <ul className="mt-6 list-none space-y-3 pl-0">
        {mudancas.map(({ regra, versao }) => (
          <li key={`${regra.id}-${versao.vigenteDesde}`} className="rounded-2xl border-2 border-tinta bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <EtiquetaVigencia versao={versao} />
              <span className="text-xs font-semibold text-cinza">{SITUACAO[versao.situacao]}</span>
            </div>
            <p className="mt-2 font-bold">
              {regra.titulo} · a partir de {formatDateBr(versao.vigenteDesde)}
            </p>
            {versao.nota && <p className="mt-1 text-sm leading-relaxed text-[#3e4b44]">{versao.nota}</p>}
            <p className="mt-2 text-xs text-cinza">
              Verificado em {formatDateBr(versao.verificadoEm)} ·{' '}
              {versao.fontes.map((fonte, i) => (
                <span key={fonte.url}>
                  {i > 0 && ' · '}
                  <a href={fonte.url} target="_blank" rel="noopener noreferrer" className="text-verde-escuro underline underline-offset-2">
                    {fonte.titulo}
                  </a>
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </PaginaTexto>
  );
}
