// Separado de lib/mercadopago.ts para poder ser importado no client
// (o SDK do MP só roda no servidor).
export const PRECO_RETROSPECTIVA = 19.9;

export const PRECO_FORMATADO = PRECO_RETROSPECTIVA.toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});
