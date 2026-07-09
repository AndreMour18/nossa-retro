import { NextResponse } from 'next/server';
import { validarAssinaturaMP } from '@/lib/mp-assinatura';
import { confirmarPagamento } from '@/lib/pagamento';

/**
 * POST /api/webhook — notificações do Mercado Pago (tópico "orders";
 * configure a URL no painel da aplicação e copie a assinatura secreta
 * para MP_WEBHOOK_SECRET). A confirmação em si vive em lib/pagamento.ts
 * (compartilhada com o polling de /api/status, que cobre webhooks
 * perdidos — em localhost é o único caminho).
 */
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const dataIdQuery = url.searchParams.get('data.id');

    // Sem o segredo configurado (dev), o webhook segue sem validação —
    // em produção isso vira um aviso alto no log.
    const segredo = process.env.MP_WEBHOOK_SECRET;
    if (segredo) {
      const valida = validarAssinaturaMP({
        xSignature: req.headers.get('x-signature'),
        xRequestId: req.headers.get('x-request-id'),
        dataId: dataIdQuery,
        segredo,
      });
      if (!valida) {
        return NextResponse.json({ error: 'assinatura inválida' }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.warn(
        'webhook sem MP_WEBHOOK_SECRET: notificações estão sendo aceitas sem validação de assinatura'
      );
    }

    const body = await req.json().catch(() => ({}));
    const paymentId = body?.data?.id ?? dataIdQuery;
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
