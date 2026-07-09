import Link from 'next/link';
import ContadorTempo from '@/components/ContadorTempo';

export default function LandingPage() {
  return (
    <main className="night-sky min-h-dvh flex flex-col">
      {/* Herói */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <p className="uppercase tracking-[0.3em] text-xs text-rose mb-6">
          o presente digital
        </p>

        <h1 className="font-display text-5xl sm:text-6xl leading-tight max-w-xl">
          A história de vocês,{' '}
          <em className="text-gold text-glow-gold">contada como merece.</em>
        </h1>

        <p className="mt-6 max-w-md text-paper/70">
          Fotos, momentos, a música de vocês e um contador do tempo juntos —
          tudo numa retrospectiva animada que abre pelo link ou QR code.
        </p>

        {/* Assinatura da página: um contador ao vivo de exemplo */}
        <div className="mt-10">
          <p className="text-xs uppercase tracking-widest text-paper/50 mb-2">
            Ana &amp; Léo estão juntos há
          </p>
          <ContadorTempo dataInicio="2022-11-14" />
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Link
            href="/criar"
            className="rounded-full bg-gold text-ink font-semibold px-8 py-4 hover:brightness-110 transition"
          >
            Criar a nossa por R$ 19,90
          </Link>
          <Link
            href="/r/demo"
            className="rounded-full border border-paper/30 px-8 py-4 hover:bg-paper/10 transition"
          >
            Ver um exemplo
          </Link>
        </div>
      </section>

      {/* Como funciona */}
      <section className="px-6 py-16 max-w-3xl mx-auto text-center">
        <h2 className="font-display text-3xl mb-8">Pronto em 5 minutos</h2>
        <p className="text-paper/70 leading-relaxed">
          Você preenche os nomes, a data em que tudo começou, escolhe as
          melhores fotos e a música que é a cara de vocês. A gente transforma
          isso numa retrospectiva animada e te entrega um link exclusivo — que
          é de vocês para sempre — junto com um QR code pronto para imprimir e
          esconder dentro de um cartão, uma caixa ou um buquê.
        </p>
      </section>

      <footer className="px-6 py-8 text-center text-xs text-paper/40">
        Feito com ❤️ no Brasil · Pagamento seguro via Pix ·{' '}
        <Link href="/privacidade" className="underline">
          Privacidade
        </Link>
      </footer>
    </main>
  );
}
