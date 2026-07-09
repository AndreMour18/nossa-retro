import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Valida o header x-signature das notificações do Mercado Pago.
 *
 * O MP assina cada notificação com HMAC-SHA256 sobre o manifesto
 * `id:{data.id};request-id:{x-request-id};ts:{ts};` usando a
 * "assinatura secreta" exibida ao configurar o webhook no painel
 * (segmentos ausentes ficam de fora do manifesto).
 */
export function validarAssinaturaMP(params: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  segredo: string;
}): boolean {
  if (!params.xSignature) return false;

  // formato: "ts=1704908010,v1=618c85345248dd820d5fd456117c2ab2ef8eda45a0282ff693eac24131a5e839"
  const partes = Object.fromEntries(
    params.xSignature.split(',').map((parte) => {
      const i = parte.indexOf('=');
      return [parte.slice(0, i).trim(), parte.slice(i + 1).trim()];
    })
  );
  const ts = partes['ts'];
  const v1 = partes['v1'];
  if (!ts || !v1) return false;

  let manifesto = '';
  if (params.dataId) manifesto += `id:${params.dataId.toLowerCase()};`;
  if (params.xRequestId) manifesto += `request-id:${params.xRequestId};`;
  manifesto += `ts:${ts};`;

  const esperado = createHmac('sha256', params.segredo)
    .update(manifesto)
    .digest('hex');

  const a = Buffer.from(esperado);
  const b = Buffer.from(v1);
  return a.length === b.length && timingSafeEqual(a, b);
}
