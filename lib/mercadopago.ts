import { PRECO_RETROSPECTIVA } from './preco';

/**
 * Integração com o Mercado Pago via fetch direto, em duas vias:
 *
 * - Sandbox (app fora de https): API de Orders (/v1/orders) — é a única
 *   que suporta Pix com credenciais de teste, com aprovação automática.
 * - Produção: API de Payments (/v1/payments) — caminho estável para Pix
 *   ao vivo; a Orders API ainda é bloqueada pelo PolicyAgent em contas
 *   comuns ("PA_UNAUTHORIZED_RESULT_FROM_POLICIES").
 */

const MP_API = 'https://api.mercadopago.com';

export function emProducao(): boolean {
  return (process.env.NEXT_PUBLIC_APP_URL ?? '').startsWith('https://');
}

function cabecalhos(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

// ————— Orders API (sandbox) —————

export type OrderMP = {
  id: string;
  status: string; // "action_required" (aguardando) | "processed" (paga) | ...
  status_detail: string;
  external_reference?: string;
  transactions?: {
    payments?: Array<{
      id: string;
      payment_method?: {
        qr_code?: string;
        qr_code_base64?: string;
        ticket_url?: string;
      };
    }>;
  };
};

export async function criarOrderPix(params: {
  retrospectivaId: string;
  emailComprador: string;
  nomeComprador?: string;
}): Promise<OrderMP> {
  // O sandbox exige e-mail de pagador @testuser.com, e o nome "APRO"
  // faz o Pix aprovar sozinho em segundos.
  const resp = await fetch(`${MP_API}/v1/orders`, {
    method: 'POST',
    headers: { ...cabecalhos(), 'X-Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify({
      type: 'online',
      processing_mode: 'automatic',
      total_amount: PRECO_RETROSPECTIVA.toFixed(2),
      external_reference: params.retrospectivaId,
      payer: {
        email: 'test_user_nossaretro@testuser.com',
        first_name: 'APRO',
      },
      transactions: {
        payments: [
          {
            amount: PRECO_RETROSPECTIVA.toFixed(2),
            payment_method: { id: 'pix', type: 'bank_transfer' },
          },
        ],
      },
    }),
  });

  if (!resp.ok) {
    throw new Error(`MP criar order ${resp.status}: ${await resp.text()}`);
  }
  return (await resp.json()) as OrderMP;
}

export async function consultarOrder(orderId: string): Promise<OrderMP> {
  const resp = await fetch(`${MP_API}/v1/orders/${orderId}`, {
    headers: cabecalhos(),
  });
  if (!resp.ok) {
    throw new Error(`MP consultar order ${resp.status}: ${await resp.text()}`);
  }
  return (await resp.json()) as OrderMP;
}

// Uma order Pix aprovada fica "processed" (status_detail "accredited")
export function orderPaga(order: OrderMP): boolean {
  return order.status === 'processed';
}

// ————— Payments API (produção) —————

export type PagamentoMP = {
  id: number;
  status: string; // "pending" | "approved" | ...
  external_reference?: string;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
};

export async function criarPagamentoPix(params: {
  retrospectivaId: string;
  emailComprador: string;
  nomeComprador?: string;
}): Promise<PagamentoMP> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const resp = await fetch(`${MP_API}/v1/payments`, {
    method: 'POST',
    headers: { ...cabecalhos(), 'X-Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify({
      transaction_amount: PRECO_RETROSPECTIVA,
      description: 'Nossa Retro — retrospectiva de relacionamento',
      payment_method_id: 'pix',
      payer: {
        email: params.emailComprador,
        ...(params.nomeComprador ? { first_name: params.nomeComprador } : {}),
      },
      external_reference: params.retrospectivaId,
      // O MP só aceita notification_url pública https
      ...(appUrl.startsWith('https://')
        ? { notification_url: `${appUrl}/api/webhook` }
        : {}),
    }),
  });

  if (!resp.ok) {
    throw new Error(`MP criar pagamento ${resp.status}: ${await resp.text()}`);
  }
  return (await resp.json()) as PagamentoMP;
}

export async function consultarPagamento(paymentId: string): Promise<PagamentoMP> {
  const resp = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: cabecalhos(),
  });
  if (!resp.ok) {
    throw new Error(`MP consultar pagamento ${resp.status}: ${await resp.text()}`);
  }
  return (await resp.json()) as PagamentoMP;
}

export { PRECO_RETROSPECTIVA };
