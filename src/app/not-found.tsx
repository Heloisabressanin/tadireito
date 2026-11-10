import Link from 'next/link';
import { tools } from '@/lib/site';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="text-sm font-bold text-cinza">Erro 404</p>
      <h1 className="titulo-display mt-2 text-6xl">Página não encontrada</h1>
      <p className="mt-3 text-cinza">Talvez você esteja procurando uma destas calculadoras:</p>
      <ul className="mt-6 space-y-2">
        {tools.map((tool) => (
          <li key={tool.href}>
            <Link href={tool.href} className="cartao-forte block rounded-2xl bg-white px-4 py-3 font-bold">
              {tool.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
