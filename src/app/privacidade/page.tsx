import type { Metadata } from 'next';
import { PaginaTexto } from '@/components/pagina-texto';
import { site } from '@/lib/site';
import { metadadosPagina } from '@/lib/metadados';

export const metadata: Metadata = metadadosPagina({
  titulo: 'Política de privacidade',
  descricao:
    'Como o Tá Direito trata os seus dados, de acordo com a LGPD: os cálculos são feitos no seu navegador e não guardamos o que você digita.',
  caminho: '/privacidade',
});

export default function PrivacidadePage() {
  return (
    <PaginaTexto chamada="LGPD" titulo="Política de privacidade" atualizadoEm="10/11/2026">
      <p>
        Esta política explica como o {site.name} trata dados pessoais, de acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018, LGPD).
      </p>

      <h2>Os valores que você digita ficam no seu aparelho</h2>
      <p>
        Todos os cálculos são feitos <strong>no seu navegador</strong>. Os valores que você digita (salário, horas, faturamento) não são enviados
        para os nossos servidores nem guardados por nós. Eles aparecem apenas no endereço da página, para que você possa compartilhar o resultado,
        e nunca pedimos nome, CPF ou outro dado que identifique você.
      </p>

      <h2>Cookies</h2>
      <p>Não usamos cookies de publicidade nem de rastreamento. Se isso mudar, esta página será atualizada antes e pediremos o seu consentimento.</p>

      <h2>Dados técnicos de acesso</h2>
      <p>
        Como qualquer site, o servidor de hospedagem registra dados técnicos de acesso (como endereço IP, data e página visitada) para segurança e
        funcionamento do serviço, com base no legítimo interesse (LGPD, art. 7º, IX). Esses registros são temporários e não são usados para
        identificar você.
      </p>

      <h2>Estatísticas de visita</h2>
      <p>
        Usamos o Vercel Web Analytics para contar visitas de forma anônima e agregada (página vista, país, tipo de aparelho). Ele não usa cookies
        e não identifica você. Os valores digitados nas calculadoras são removidos antes de qualquer envio.
      </p>

      <h2>Quando você escreve para nós</h2>
      <p>
        Se você nos enviar um e-mail, usamos o seu endereço e a sua mensagem apenas para responder. Você pode pedir a exclusão a qualquer momento.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir acesso, correção ou exclusão dos seus dados e tirar dúvidas sobre esta política pelo e-mail{' '}
        <a href={`mailto:${site.contato}`} className="text-verde-escuro underline">
          {site.contato}
        </a>
        .
      </p>
    </PaginaTexto>
  );
}
