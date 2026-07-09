import { NextResponse } from 'next/server';
import { confirmarPagamento } from '@/lib/pagamento';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/status?id=<retrospectivaId>
 * Devolve { status, slug? } — slug só quando paga.
 *
 * Se estiver aguardando pagamento, consulta o Mercado Pago na hora:
 * é isso que permite testar sem ngrok e cobre webhooks perdidos.
 */
export async function GET(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
    }

    const db = supabaseAdmin();
    const { data: retro, error } = await db
      .from('retrospectivas')
      .select('id, status, slug, payment_id')
      .eq('id', id)
      .single();

    if (error || !retro) {
      return NextResponse.json({ error: 'Não encontrada' }, { status: 404 });
    }

    if (retro.status === 'paga') {
      return NextResponse.json({ status: 'paga', slug: retro.slug });
    }

    if (retro.status === 'aguardando_pagamento' && retro.payment_id) {
      try {
        const resultado = await confirmarPagamento(retro.payment_id);
        if (resultado.paga) {
          return NextResponse.json({ status: 'paga', slug: resultado.slug });
        }
      } catch (err) {
        console.error('status: erro ao consultar pagamento', err);
        // segue devolvendo o status atual; o polling tenta de novo
      }
    }

    return NextResponse.json({ status: retro.status });
  } catch (err) {
    console.error('status error', err);
    return NextResponse.json({ error: 'Erro ao consultar status' }, { status: 500 });
  }
}
