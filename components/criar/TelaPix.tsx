'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import BotaoCopiar from '@/components/BotaoCopiar';
import { PRECO_FORMATADO } from '@/lib/preco';

/**
 * Tela de pagamento Pix: cria o pagamento no /api/checkout, mostra o
 * QR code + copia-e-cola e fica consultando /api/status até aprovar.
 * Quando aprova, leva para /sucesso/[slug].
 */

const INTERVALO_POLLING_MS = 4000;

type Pix = { qrCode?: string; qrCodeBase64?: string };

export default function TelaPix({
  retrospectivaId,
  onVoltar,
}: {
  retrospectivaId: string;
  onVoltar: () => void;
}) {
  const router = useRouter();
  const [pix, setPix] = useState<Pix | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const criouPagamento = useRef(false);

  // Cria o pagamento uma única vez (o ref segura o StrictMode do dev)
  useEffect(() => {
    if (criouPagamento.current) return;
    criouPagamento.current = true;

    (async () => {
      try {
        const resp = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ retrospectivaId }),
        });
        if (!resp.ok) {
          const dados = (await resp.json().catch(() => ({}))) as { error?: string };
          throw new Error(dados.error);
        }
        setPix((await resp.json()) as Pix);
      } catch (err) {
        setErro(
          err instanceof Error && err.message
            ? err.message
            : 'Não conseguimos gerar o Pix agora. Tente de novo em instantes.'
        );
      }
    })();
  }, [retrospectivaId]);

  // Polling do status até o pagamento aprovar
  useEffect(() => {
    if (!pix) return;
    const timer = setInterval(async () => {
      try {
        const resp = await fetch(`/api/status?id=${retrospectivaId}`);
        if (!resp.ok) return;
        const dados = (await resp.json()) as { status: string; slug?: string };
        if (dados.status === 'paga' && dados.slug) {
          clearInterval(timer);
          router.push(`/sucesso/${dados.slug}`);
        }
      } catch {
        // sem rede — tenta no próximo tick
      }
    }, INTERVALO_POLLING_MS);
    return () => clearInterval(timer);
  }, [pix, retrospectivaId, router]);

  return (
    <main className="night-sky min-h-dvh px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-md flex-1 flex flex-col items-center text-center">
        <h1 className="font-display text-3xl mb-2">Quase lá! 💛</h1>
        <p className="text-paper/60 text-sm mb-8">
          Pague {PRECO_FORMATADO} via Pix e o link eterno de vocês chega na
          tela e no seu e-mail.
        </p>

        {erro && (
          <div className="w-full rounded-xl bg-plum border border-rose/40 p-5 space-y-4">
            <p className="text-rose text-sm">{erro}</p>
            <button
              onClick={onVoltar}
              className="rounded-full border border-paper/25 px-5 py-2 hover:bg-paper/10 transition"
            >
              ← Voltar para a prévia
            </button>
          </div>
        )}

        {!erro && !pix && (
          <p className="text-paper/60 animate-pulse mt-16">Gerando seu Pix…</p>
        )}

        {!erro && pix && (
          <>
            {pix.qrCodeBase64 && (
              <div className="rounded-2xl bg-paper p-4 shadow-2xl shadow-black/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${pix.qrCodeBase64}`}
                  alt="QR code do Pix"
                  className="h-56 w-56"
                />
              </div>
            )}

            {pix.qrCode && (
              <div className="w-full mt-6 space-y-3">
                <p className="text-xs uppercase tracking-widest text-paper/40">
                  ou copie o código Pix
                </p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={pix.qrCode}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 min-w-0 rounded-xl bg-plum border border-paper/15 px-4 py-2 text-xs text-paper/70 outline-none"
                  />
                  <BotaoCopiar texto={pix.qrCode} />
                </div>
              </div>
            )}

            <p className="mt-10 text-paper/50 text-sm animate-pulse">
              Esperando a confirmação do banco… isso leva poucos segundos
              após o pagamento.
            </p>
          </>
        )}
      </div>

      {!erro && (
        <button
          onClick={onVoltar}
          className="w-full max-w-md rounded-full border border-paper/25 py-3 hover:bg-paper/10 transition mt-8"
        >
          ← Voltar para a prévia
        </button>
      )}
    </main>
  );
}
