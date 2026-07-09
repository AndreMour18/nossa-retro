import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/upload
 * FormData: file (imagem já comprimida no client) + rascunhoId (opcional)
 * Salva no bucket público "fotos" e devolve { url }.
 */

// O client comprime para ~0.8 MB; a folga cobre metadados e GIFs
const MAX_BYTES = 4 * 1024 * 1024;

const EXTENSOES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    const rascunhoId = form.get('rascunhoId');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Envie o campo "file"' }, { status: 400 });
    }
    const ext = EXTENSOES[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: 'Formato não suportado (use JPG, PNG, WebP, GIF ou AVIF)' },
        { status: 415 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Imagem grande demais (máx. 4 MB)' }, { status: 413 });
    }

    // Agrupa por rascunho para facilitar limpeza de abandonados no futuro
    const pasta = typeof rascunhoId === 'string' && rascunhoId ? rascunhoId : 'avulsas';
    const caminho = `${pasta}/${nanoid(10)}.${ext}`;

    const db = supabaseAdmin();
    const { error } = await db.storage.from('fotos').upload(caminho, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) {
      console.error('upload error', error);
      return NextResponse.json({ error: 'Erro ao salvar a imagem' }, { status: 500 });
    }

    const { data } = db.storage.from('fotos').getPublicUrl(caminho);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    console.error('upload error', err);
    return NextResponse.json({ error: 'Erro ao processar o envio' }, { status: 500 });
  }
}
