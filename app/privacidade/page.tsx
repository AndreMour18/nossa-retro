import type { Metadata } from 'next';
import Link from 'next/link';

// Troque pelo e-mail oficial de contato quando tiver domínio próprio
const EMAIL_CONTATO = 'andremourdev@outlook.com';

export const metadata: Metadata = {
  title: 'Privacidade — Nossa Retro',
  description:
    'Como a Nossa Retro trata seus dados: o que coletamos, por quanto tempo guardamos e como pedir exclusão.',
};

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl text-gold">{titulo}</h2>
      <div className="space-y-3 text-paper/80 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacidadePage() {
  return (
    <main className="night-sky min-h-dvh px-6 py-14">
      <article className="mx-auto max-w-2xl space-y-10">
        <header className="space-y-3">
          <h1 className="font-display text-4xl text-gold text-glow-gold">
            Privacidade
          </h1>
          <p className="text-paper/60">
            A Nossa Retro guarda memórias de casais — e memória é coisa
            íntima. Esta página explica, sem juridiquês, o que coletamos e o
            que fazemos (e não fazemos) com isso, em linha com a LGPD
            (Lei 13.709/2018).
          </p>
        </header>

        <Secao titulo="O que coletamos">
          <p>
            Somente o que você digita ou envia ao criar uma retrospectiva:
            os nomes do casal, a data de início, fotos, textos dos momentos,
            o link da música, a mensagem final e o seu e-mail (usado para
            entregar o link e tratar pedidos de suporte).
          </p>
          <p>
            O pagamento é processado pelo Mercado Pago — dados de Pix,
            cartão ou conta <strong>não passam pelos nossos servidores</strong>{' '}
            e não temos acesso a eles.
          </p>
        </Secao>

        <Secao titulo="Para que usamos">
          <p>
            Exclusivamente para criar, hospedar e entregar a sua
            retrospectiva. Não vendemos nem compartilhamos seus dados ou
            fotos com terceiros para publicidade — as únicas empresas que
            tocam nos dados são as que fazem o serviço funcionar
            (hospedagem, banco de dados, e-mail e pagamento), cada uma com
            suas próprias garantias de segurança.
          </p>
        </Secao>

        <Secao titulo="Quem pode ver a retrospectiva">
          <p>
            Só quem tiver o link. Os endereços usam um código aleatório
            impossível de adivinhar, e pedimos aos buscadores que{' '}
            <strong>não indexem</strong> essas páginas. Ainda assim, o link é
            uma chave: compartilhe apenas com quem você quiser.
          </p>
        </Secao>

        <Secao titulo="Por quanto tempo guardamos">
          <p>
            Rascunhos não finalizados são apagados automaticamente em até 7
            dias. Retrospectivas pagas ficam no ar por tempo indeterminado —
            o link é seu — até que você peça a exclusão.
          </p>
        </Secao>

        <Secao titulo="Seus direitos (LGPD)">
          <p>
            Você pode pedir a qualquer momento: acesso aos dados que temos
            sobre você, correção, ou <strong>exclusão definitiva</strong> da
            retrospectiva, das fotos e do seu e-mail dos nossos registros.
            É só escrever para{' '}
            <a
              href={`mailto:${EMAIL_CONTATO}`}
              className="underline decoration-gold/50 hover:decoration-gold"
            >
              {EMAIL_CONTATO}
            </a>{' '}
            usando o e-mail com que criou a retrospectiva. Atendemos em até
            15 dias.
          </p>
        </Secao>

        <Secao titulo="Cookies e dados no seu navegador">
          <p>
            Não usamos cookies de rastreamento nem publicidade. Durante a
            criação, o rascunho fica salvo no armazenamento local do{' '}
            <em>seu</em> navegador para você não perder o preenchimento —
            esse dado não sai do seu aparelho e some se você limpar o
            navegador.
          </p>
        </Secao>

        <Secao titulo="Fotos de terceiros">
          <p>
            Ao enviar fotos, você declara ter o direito de usá-las —
            inclusive o consentimento de quem aparece nelas. Se você aparece
            em uma retrospectiva criada por outra pessoa e quer a remoção,
            escreva para o e-mail acima com o link da página.
          </p>
        </Secao>

        <footer className="border-t border-paper/15 pt-6 text-sm text-paper/40">
          <p>Última atualização: julho de 2026.</p>
          <p className="mt-2">
            <Link href="/" className="underline hover:text-paper">
              ← Voltar para o início
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
