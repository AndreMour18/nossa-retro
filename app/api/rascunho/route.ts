import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { supabaseAdmin } from '@/lib/supabase';
import type { Foto, Momento, Musica } from '@/lib/types';

/**
 * POST /api/rascunho
 * body: { id?, nome_1, nome_2, data_inicio, email_comprador,
 *         fotos, momentos, musica, mensagem_final }
 * Cria (sem id) ou atualiza (com id) uma retrospectiva em rascunho e
 * devolve { id, slug }. Nunca toca em retrospectivas já pagas.
 */

type Body = {
  id?: string;
  nome_1?: string;
  nome_2?: string;
  data_inicio?: string;
  email_comprador?: string;
  fotos?: Foto[];
  momentos?: Momento[];
  musica?: Musica | null;
  mensagem_final?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const nome_1 = body.nome_1?.trim();
    const nome_2 = body.nome_2?.trim();
    const email = body.email_comprador?.trim().toLowerCase();

    if (!nome_1 || !nome_2 || !body.data_inicio || !email) {
      return NextResponse.json(
        { error: 'nome_1, nome_2, data_inicio e email_comprador são obrigatórios' },
        { status: 400 }
      );
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 });
    }

    // Só persiste fotos que já viraram URL pública (object URLs ficam no client)
    const fotos = (body.fotos ?? []).filter((f) => /^https?:\/\//.test(f.url));

    const campos = {
      nome_1,
      nome_2,
      data_inicio: body.data_inicio,
      email_comprador: email,
      fotos,
      momentos: body.momentos ?? [],
      musica: body.musica ?? null,
      mensagem_final: body.mensagem_final ?? '',
    };

    const db = supabaseAdmin();

    if (body.id) {
      const { data, error } = await db
        .from('retrospectivas')
        .update(campos)
        .eq('id', body.id)
        .eq('status', 'rascunho')
        .select('id, slug')
        .single();

      // Se o id não existe mais (rascunho expirado), cai no insert abaixo
      if (!error && data) {
        return NextResponse.json({ id: data.id, slug: data.slug });
      }
    }

    const { data, error } = await db
      .from('retrospectivas')
      .insert({ ...campos, slug: nanoid(12), status: 'rascunho' })
      .select('id, slug')
      .single();

    if (error || !data) {
      console.error('rascunho insert error', error);
      return NextResponse.json({ error: 'Erro ao salvar o rascunho' }, { status: 500 });
    }

    return NextResponse.json({ id: data.id, slug: data.slug });
  } catch (err) {
    console.error('rascunho error', err);
    return NextResponse.json({ error: 'Erro ao processar o rascunho' }, { status: 500 });
  }
}
