import { NextResponse } from 'next/server';
import { confirmarPagamento } from '@/lib/pagamento';

/**
 * POST /api/webhook — notificações do Mercado Pago (tópico "orders";
 * configure a URL no painel da aplicação). A confirmação em si vive em
 * lib/pagamento.ts (compartilhada com o polling de /api/status, que
 * cobre webhooks perdidos — em localhost é o único caminho).
 *
 * TODO (produção): validar a assinatura x-signature do Mercado Pago
 * antes de confiar na notificação.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const paymentId = body?.data?.id ?? new URL(req.url).searchParams.get('data.id');
    if (!paymentId) return NextResponse.json({ ok: true }); // ignora pings

    await confirmarPagamento(String(paymentId));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('webhook error', err);
    // Responder 200 evita retries infinitos por erros nossos;
    // monitore os logs na Vercel.
    return NextResponse.json({ ok: true });
  }
}
