import { LogoMark } from '@/components/logo';
import { formatDateBr } from '@/lib/regras/dates';

/** Brand signature: "✓ Conferido com a lei · dd/mm/aaaa". Same seal under every result and in the footer. */
export function SeloConferido({ data, escuro }: { data: string; escuro?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border-2 py-1 pr-3 pl-1 text-xs font-extrabold tracking-wide uppercase ${
        escuro ? 'border-white/40 text-white' : 'border-tinta bg-white text-tinta'
      }`}
    >
      <LogoMark className="size-5" />
      Conferido com a lei · {formatDateBr(data)}
    </span>
  );
}
