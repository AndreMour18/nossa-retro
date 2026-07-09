import { NextResponse } from 'next/server';
import { criarOrderPix } from '@/lib/mercadopago';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/checkout
 * body: { retrospectivaId: string }
 * Cria uma order Pix no Mercado Pago e devolve o QR code.
 *
 * A confirmação do pagamento acontece pelo polling do /api/status (que
 * consulta o MP diretamente) e, em produção, também pelo webhook.
 */
export async function POST(req: Request) {
  try {
    const { retrospectivaId } = await req.json();
    if (!retrospectivaId) {
      return NextResponse.json({ error: 'retrospectivaId é obrigatório' }, { status: 400 });
    }

    const db = supabaseAdmin();
    const { data: retro, error } = await db
      .from('retrospectivas')
      .select('id, email_comprador, nome_1, status')
      .eq('id', retrospectivaId)
      .single();

    if (error || !retro) {
      return NextResponse.json({ error: 'Retrospectiva não encontrada' }, { status: 404 });
    }
    if (retro.status === 'paga') {
      return NextResponse.json({ error: 'Já paga' }, { status: 409 });
    }

    const order = await criarOrderPix({
      retrospectivaId: retro.id,
      emailComprador: retro.email_comprador,
      nomeComprador: retro.nome_1,
    });

    await db
      .from('retrospectivas')
      .update({ status: 'aguardando_pagamento', payment_id: order.id })
      .eq('id', retro.id);

    const pix = order.transactions?.payments?.[0]?.payment_method;
    return NextResponse.json({
      paymentId: order.id,
      qrCode: pix?.qr_code,              // copia-e-cola
      qrCodeBase64: pix?.qr_code_base64, // imagem
    });
  } catch (err) {
    console.error('checkout error', err);
    return NextResponse.json({ error: 'Erro ao criar pagamento' }, { status: 500 });
  }
}
