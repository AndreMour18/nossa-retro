'use client';

import { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import type { FotoForm } from '@/lib/types';

export const MAX_FOTOS = 10;

/**
 * Etapa de fotos: seleção + compressão no navegador.
 * As fotos ficam em memória (object URLs) até o /api/upload existir;
 * o arquivo comprimido fica em foto.file pronto para o envio.
 */
export default function EtapaFotos({
  fotos,
  onChange,
  rascunhoId,
}: {
  fotos: FotoForm[];
  onChange: (fotos: FotoForm[]) => void;
  rascunhoId?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [comprimindo, setComprimindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function adicionarFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files ?? []);
    e.target.value = ''; // permite escolher o mesmo arquivo de novo
    if (arquivos.length === 0) return;

    const vagas = MAX_FOTOS - fotos.length;
    if (arquivos.length > vagas) {
      setErro(`Só cabem mais ${vagas} foto${vagas === 1 ? '' : 's'} (máx. ${MAX_FOTOS}).`);
    } else {
      setErro(null);
    }

    setComprimindo(true);
    try {
      const novas: FotoForm[] = [];
      for (const arquivo of arquivos.slice(0, vagas)) {
        const resultado = await imageCompression(arquivo, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        });
        const file =
          resultado instanceof File
            ? resultado
            : new File([resultado], arquivo.name, { type: arquivo.type });
        novas.push(await enviarFoto(file, rascunhoId));
      }
      onChange([...fotos, ...novas]);
    } catch {
      setErro('Não conseguimos processar uma das imagens. Tente outra?');
    } finally {
      setComprimindo(false);
    }
  }

  // Tenta subir para o bucket; se a API falhar, mantém a foto local
  // (object URL + file) para reenviar depois.
  async function enviarFoto(
    file: File,
    rascunhoId?: string | null
  ): Promise<FotoForm> {
    try {
      const dados = new FormData();
      dados.append('file', file);
      if (rascunhoId) dados.append('rascunhoId', rascunhoId);
      const resp = await fetch('/api/upload', { method: 'POST', body: dados });
      if (resp.ok) {
        const { url } = (await resp.json()) as { url: string };
        return { url };
      }
    } catch {
      // sem rede/API — segue com a versão local
    }
    return { url: URL.createObjectURL(file), file };
  }

  function atualizarFoto(idx: number, patch: Partial<FotoForm>) {
    onChange(fotos.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  }

  function removerFoto(idx: number) {
    URL.revokeObjectURL(fotos[idx].url);
    onChange(fotos.filter((_, i) => i !== idx));
  }

  function moverFoto(idx: number, direcao: -1 | 1) {
    const destino = idx + direcao;
    if (destino < 0 || destino >= fotos.length) return;
    const novas = [...fotos];
    [novas[idx], novas[destino]] = [novas[destino], novas[idx]];
    onChange(novas);
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl text-center mb-2">
        As fotos de vocês
      </h1>
      <p className="text-center text-sm text-paper/60 mb-6">
        Escolha até {MAX_FOTOS} fotos, na ordem em que vão aparecer.
        Legenda e data são opcionais.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={adicionarFotos}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={comprimindo || fotos.length >= MAX_FOTOS}
        className="w-full rounded-xl border-2 border-dashed border-paper/25 py-8 text-paper/70 hover:border-gold hover:text-gold transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {comprimindo
          ? 'Preparando as fotos…'
          : fotos.length >= MAX_FOTOS
            ? `Limite de ${MAX_FOTOS} fotos atingido`
            : '📷 Toque para adicionar fotos'}
      </button>

      {erro && <p className="text-rose text-sm text-center">{erro}</p>}

      <ul className="space-y-4">
        {fotos.map((foto, idx) => (
          <li
            key={foto.url}
            className="flex gap-3 rounded-xl bg-plum border border-paper/15 p-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={foto.url}
              alt={foto.legenda || `Foto ${idx + 1}`}
              className="h-24 w-24 shrink-0 rounded-lg object-cover"
            />
            <div className="flex-1 space-y-2 min-w-0">
              <input
                value={foto.legenda ?? ''}
                onChange={(e) => atualizarFoto(idx, { legenda: e.target.value })}
                placeholder="Legenda (ex.: Nosso primeiro rolê)"
                className="w-full rounded-lg bg-ink/60 border border-paper/15 px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <input
                value={foto.data ?? ''}
                onChange={(e) => atualizarFoto(idx, { data: e.target.value })}
                placeholder="Quando? (ex.: jan 2024)"
                className="w-full rounded-lg bg-ink/60 border border-paper/15 px-3 py-2 text-sm outline-none focus:border-gold"
              />
            </div>
            <div className="flex flex-col justify-between items-center">
              <button
                type="button"
                onClick={() => moverFoto(idx, -1)}
                disabled={idx === 0}
                aria-label="Mover foto para cima"
                className="text-paper/50 hover:text-gold disabled:opacity-20 transition"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => removerFoto(idx)}
                aria-label="Remover foto"
                className="text-paper/50 hover:text-rose transition"
              >
                ✕
              </button>
              <button
                type="button"
                onClick={() => moverFoto(idx, 1)}
                disabled={idx === fotos.length - 1}
                aria-label="Mover foto para baixo"
                className="text-paper/50 hover:text-gold disabled:opacity-20 transition"
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
