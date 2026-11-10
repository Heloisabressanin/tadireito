import type { Metadata } from 'next';
import { DadosEstruturados, perguntasFrequentes } from '@/components/dados-estruturados';
import { LogoMark } from '@/components/logo';
import { IconeCadeado, IconeGratis, IconeLei, IconeLeve, IconeRaio, IconeSemLoja } from '@/components/marca/icones';
import { FaixaOndas } from '@/components/marca/faixa';
import { Perguntas, type Pergunta } from '@/components/pagina-ferramenta';
import { InstalarApp } from '@/features/instalar/instalar-app';
import { metadadosPagina } from '@/lib/metadados';
import { site } from '@/lib/site';

export const metadata: Metadata = metadadosPagina({
  titulo: 'Baixe o app Tá Direito grátis (Android, iPhone e computador)',
  descricao:
    'Instale o Tá Direito no celular em 10 segundos, direto pelo navegador: sem loja de apps, sem cadastro e sempre atualizado com a lei. Salário líquido, hora extra e limite do MEI.',
  caminho: '/app',
});

const VANTAGENS = [
  { icone: <IconeRaio />, titulo: 'Abre em um toque', texto: 'Fica na tela inicial, como qualquer app.' },
  { icone: <IconeSemLoja />, titulo: 'Sem loja de apps', texto: 'Instala direto pelo navegador, em 10 segundos.' },
  { icone: <IconeLeve />, titulo: 'Quase não ocupa espaço', texto: 'Bem mais leve que um app comum.' },
  { icone: <IconeLei />, titulo: 'Sempre atualizado com a lei', texto: 'Sem precisar baixar atualizações.' },
  { icone: <IconeCadeado />, titulo: 'Sem cadastro', texto: 'Seus valores ficam só no seu aparelho.' },
  { icone: <IconeGratis />, titulo: 'Grátis', texto: 'Todas as calculadoras, sem pagar nada.' },
];

const PERGUNTAS: Pergunta[] = [
  {
    pergunta: 'É seguro instalar?',
    resposta:
      'Sim. O app é o próprio site do Tá Direito instalado pelo seu navegador: não baixa nenhum arquivo desconhecido, não pede permissões e não acessa seus dados. Você pode remover quando quiser, como qualquer app.',
  },
  {
    pergunta: 'Por que não está na Play Store ou na App Store?',
    resposta:
      'Instalando pelo navegador você recebe as atualizações da lei na hora, sem esperar a aprovação de uma loja, e o app fica bem mais leve. Funciona no Android, no iPhone e no computador.',
  },
  {
    pergunta: 'Precisa de internet?',
    resposta: 'Sim, por enquanto o app precisa de internet para abrir. Os cálculos são feitos no seu próprio aparelho.',
  },
  {
    pergunta: 'Como removo o app?',
    resposta: 'Como qualquer app: toque e segure o ícone na tela inicial e escolha remover.',
  },
];

export default function AppPage() {
  const mensagem = encodeURIComponent(`Instale o ${site.name} no celular: calculadoras de salário, hora extra e MEI, grátis e atualizadas com a lei.\n${site.url}/app`);

  return (
    <>
    <FaixaOndas>
      <div className="mx-auto flex max-w-3xl items-center gap-5 px-4 pt-9 pb-12 sm:px-6">
        <LogoMark className="size-20 shrink-0 drop-shadow-xl sm:size-24" />
        <div>
          <h1 className="titulo-display text-[40px] text-balance sm:text-6xl">O Tá Direito no seu celular</h1>
          <p className="mt-2 text-lg font-semibold">Grátis, sem loja de apps e sem cadastro.</p>
        </div>
      </div>
    </FaixaOndas>
    <div className="mx-auto max-w-3xl px-4 sm:px-6">

      <section aria-labelledby="como-instalar" className="mt-8">
        <h2 id="como-instalar" className="titulo-display mb-4 text-3xl">
          Como instalar
        </h2>
        <InstalarApp />
      </section>

      <section aria-labelledby="vantagens" className="mt-10">
        <h2 id="vantagens" className="titulo-display mb-4 text-3xl">
          Por que instalar
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {VANTAGENS.map((v) => (
            <li key={v.titulo} className="flex gap-3 rounded-2xl border-2 border-tinta bg-white p-4">
              <span className="shrink-0">{v.icone}</span>
              <span>
                <strong className="block">{v.titulo}</strong>
                <span className="text-sm text-cinza">{v.texto}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="perguntas" className="mt-10">
        <h2 id="perguntas" className="titulo-display mb-4 text-3xl">
          Perguntas frequentes
        </h2>
        <Perguntas perguntas={PERGUNTAS} />
        <DadosEstruturados dados={[perguntasFrequentes(PERGUNTAS)]} />
      </section>

      <a
        href={`https://wa.me/?text=${mensagem}`}
        target="_blank"
        rel="noopener noreferrer"
        className="cartao-forte mt-10 block rounded-2xl bg-whatsapp py-4 text-center font-extrabold text-white hover:brightness-95"
      >
        Enviar o app pelo WhatsApp
      </a>
    </div>
    </>
  );
}
