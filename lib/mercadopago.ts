import { PRECO_RETROSPECTIVA } from './preco';

/**
 * Integração com a API de Orders do Mercado Pago (a atual do Checkout API),
 * via fetch direto. A Orders API é a única que suporta Pix também em
 * sandbox — a /v1/payments legada recusa Pix com credenciais de teste
 * ("Unauthorized use of live credentials").
 */

const MP_API = 'https://api.mercadopago.com';

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

function cabecalhos(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

export async function criarOrderPix(params: {
  retrospectivaId: string;
  emailComprador: string;
  nomeComprador?: string;
}): Promise<OrderMP> {
  // Em desenvolvimento (app fora de https), o sandbox exige e-mail de
  // pagador @testuser.com e o nome "APRO" faz o Pix aprovar sozinho em
  // segundos; em produção vão o e-mail e o nome reais do comprador.
  const emProducao = (process.env.NEXT_PUBLIC_APP_URL ?? '').startsWith('https://');
  const firstName = emProducao ? params.nomeComprador : 'APRO';
  const emailPagador = emProducao
    ? params.emailComprador
    : 'test_user_nossaretro@testuser.com';

  const resp = await fetch(`${MP_API}/v1/orders`, {
    method: 'POST',
    headers: { ...cabecalhos(), 'X-Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify({
      type: 'online',
      processing_mode: 'automatic',
      total_amount: PRECO_RETROSPECTIVA.toFixed(2),
      external_reference: params.retrospectivaId,
      payer: {
        email: emailPagador,
        ...(firstName ? { first_name: firstName } : {}),
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

export { PRECO_RETROSPECTIVA };
