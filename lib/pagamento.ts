import { nanoid } from 'nanoid';
import { Resend } from 'resend';
import {
  consultarOrder,
  consultarPagamento,
  orderPaga,
} from './mercadopago';
import { supabaseAdmin } from './supabase';

/**
 * Consulta a cobrança na API do Mercado Pago e, se aprovada, marca a
 * retrospectiva como paga e envia o e-mail de entrega. Idempotente:
 * chamadas repetidas (webhook + polling) não duplicam nada.
 *
 * Aceita os dois tipos de id: order do sandbox ("ORD…") e payment
 * numérico da produção — ver lib/mercadopago.ts.
 */
export async function confirmarPagamento(
  cobrancaId: string
): Promise<{ paga: boolean; slug?: string }> {
  // Sempre re-consultar na API (nunca confiar só no payload recebido)
  let aprovada: boolean;
  let retroId: string | undefined;

  if (/^ORD/i.test(cobrancaId)) {
    const order = await consultarOrder(cobrancaId);
    aprovada = orderPaga(order);
    retroId = order.external_reference;
  } else {
    const pagamento = await consultarPagamento(cobrancaId);
    aprovada = pagamento.status === 'approved';
    retroId = pagamento.external_reference;
  }

  if (!aprovada || !retroId) return { paga: false };

  const db = supabaseAdmin();

  const { data: retro } = await db
    .from('retrospectivas')
    .select('id, slug, status, email_comprador, nome_1, nome_2')
    .eq('id', retroId)
    .single();

  if (!retro) return { paga: false };
  if (retro.status === 'paga') return { paga: true, slug: retro.slug };

  const slug = retro.slug || nanoid(12);
  await db
    .from('retrospectivas')
    .update({ status: 'paga', slug })
    .eq('id', retro.id);

  // E-mail é melhor esforço: se falhar, o comprador ainda vê o link na
  // tela de sucesso (o polling já devolve o slug).
  try {
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/r/${slug}`;
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: erroEmail } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: retro.email_comprador,
      subject: `A retrospectiva de ${retro.nome_1} & ${retro.nome_2} está pronta! ❤️`,
      html: `
        <p>Está tudo pronto! 🎉</p>
        <p>O link exclusivo de vocês (é seu para sempre):</p>
        <p><a href="${link}">${link}</a></p>
        <p>Dica: gere o QR code deste link e esconda dentro de um cartão ou caixa de presente.</p>
      `,
    });
    // O SDK do Resend não lança em erro de API — devolve { error }
    if (erroEmail) console.error('erro ao enviar e-mail de entrega', erroEmail);
  } catch (err) {
    console.error('erro ao enviar e-mail de entrega', err);
  }

  return { paga: true, slug };
}
