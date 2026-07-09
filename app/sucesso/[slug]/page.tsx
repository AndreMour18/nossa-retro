import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import QRCode from 'qrcode';
import BotaoCopiar from '@/components/BotaoCopiar';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Página de sucesso pós-pagamento: o link eterno, botão de copiar e o
 * QR code do link para baixar (esconder num cartão, caixa de presente…).
 * Só existe para retrospectivas pagas.
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function SucessoPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: retro, error } = await supabaseAdmin()
    .from('retrospectivas')
    .select('slug, nome_1, nome_2, status')
    .eq('slug', params.slug)
    .eq('status', 'paga')
    .single();

  if (error || !retro) notFound();

  const link = `${process.env.NEXT_PUBLIC_APP_URL}/r/${retro.slug}`;

  // QR nas cores do tema: tinta da noite sobre papel
  const qrDataUrl = await QRCode.toDataURL(link, {
    width: 512,
    margin: 2,
    color: { dark: '#14101E', light: '#FBF6EE' },
  });

  return (
    <main className="night-sky min-h-dvh px-6 py-12 flex flex-col items-center text-center">
      <div className="w-full max-w-md space-y-8">
        <div>
          <p className="text-4xl mb-3">🎉</p>
          <h1 className="font-display text-4xl text-gold text-glow-gold">
            Está pronta!
          </h1>
          <p className="mt-3 text-paper/70">
            A retrospectiva de {retro.nome_1} &amp; {retro.nome_2} agora tem
            um link eterno — também enviamos tudo para o seu e-mail.
          </p>
        </div>

        <div className="rounded-xl bg-plum border border-paper/15 p-5 space-y-3">
          <p className="text-xs uppercase tracking-widest text-gold">
            O link de vocês
          </p>
          <a
            href={link}
            className="block break-all text-paper/90 underline decoration-gold/50 hover:decoration-gold"
          >
            {link}
          </a>
          <BotaoCopiar texto={link} rotulo="Copiar link" />
        </div>

        <div className="rounded-xl bg-plum border border-paper/15 p-5 space-y-4">
          <p className="text-xs uppercase tracking-widest text-gold">
            QR code para presentear
          </p>
          <div className="mx-auto w-fit rounded-2xl bg-paper p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt={`QR code de ${link}`} className="h-48 w-48" />
          </div>
          <p className="text-sm text-paper/60">
            Baixe, imprima e esconda dentro de um cartão ou caixa de
            presente. 💌
          </p>
          <a
            href={qrDataUrl}
            download={`nossa-retro-${retro.slug}.png`}
            className="inline-block rounded-full bg-gold text-ink font-semibold px-5 py-2 hover:brightness-110 transition"
          >
            Baixar QR code
          </a>
        </div>

        <a
          href={link}
          className="inline-block text-paper/50 hover:text-paper transition text-sm"
        >
          Ver a retrospectiva agora →
        </a>
      </div>
    </main>
  );
}
