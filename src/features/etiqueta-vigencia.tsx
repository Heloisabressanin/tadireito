'use client';

import { dataDaUltimaVerificacao } from '@/lib/regras/catalogo';
import { formatDateBr, type IsoDate } from '@/lib/regras/dates';
import type { Versao } from '@/lib/regras/schema';
import { useHoje } from '@/lib/ui/hoje';

/** "EM BREVE · 16/12/2026" / "EM VIGOR" / "ENCERRADA", computed against today's date in the browser. */
export function EtiquetaVigencia({ versao }: { versao: Pick<Versao<unknown>, 'vigenteDesde' | 'vigenteAte' | 'situacao'> }) {
  const hoje: IsoDate = useHoje(dataDaUltimaVerificacao);
  const futura = versao.vigenteDesde > hoje;
  const encerrada = !!versao.vigenteAte && versao.vigenteAte < hoje;

  const [texto, cor] = futura
    ? [`${versao.situacao === 'proposta' ? 'PREVISTO' : 'EM BREVE'} · ${formatDateBr(versao.vigenteDesde)}`, 'bg-amarelo text-tinta']
    : encerrada
      ? ['ENCERRADA', 'bg-[#e4ebe7] text-cinza']
      : ['EM VIGOR', 'bg-verde-claro text-verde-escuro'];

  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${cor}`}>{texto}</span>;
}
