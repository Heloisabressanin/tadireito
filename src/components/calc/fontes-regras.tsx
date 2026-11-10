import { SeloConferido } from '@/components/marca/selo';
import type { RegraResolvida } from '@/lib/regras/resolver';
import { site } from '@/lib/site';

/** Signed sources block under every result: seal, official links, disclaimer and error report. */
export function FontesRegras({ regras }: { regras: RegraResolvida<unknown>[] }) {
  const verificadoEm = regras.map((r) => r.versao.verificadoEm).sort()[0];
  const fontes = [...new Map(regras.flatMap((r) => r.versao.fontes).map((f) => [f.url, f])).values()];

  return (
    <div className="space-y-2.5 rounded-2xl border-2 border-tinta/15 bg-white p-4 text-xs leading-relaxed text-cinza">
      <SeloConferido data={verificadoEm} />
      <div>
        <p className="font-extrabold text-tinta">Fontes oficiais</p>
        <ul className="mt-1 space-y-0.5">
          {fontes.map((fonte) => (
            <li key={fonte.url}>
              <a href={fonte.url} target="_blank" rel="noopener noreferrer" className="text-verde-escuro underline underline-offset-2">
                {fonte.titulo}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p>
        Valores estimados para fins informativos. Consulte o RH da sua empresa ou um contador.{' '}
        <a href={`mailto:${site.contato}?subject=Erro%20no%20c%C3%A1lculo`} className="font-bold text-verde-escuro underline underline-offset-2">
          Encontrou um erro?
        </a>
      </p>
    </div>
  );
}
