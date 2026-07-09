'use client';

import { useState } from 'react';
import type { Musica } from '@/lib/types';

/**
 * Etapa da música (opcional): aceita link do Spotify (faixa/álbum/playlist)
 * ou do YouTube e mostra o player embutido na hora, igual aparecerá na
 * retrospectiva.
 */

// Normaliza o link para o formato que o StoryPlayer espera
export function interpretarUrlMusica(url: string): Musica | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname === 'open.spotify.com') {
      const caminho = u.pathname.replace(/^\/intl-[\w-]+/, '');
      if (/^\/(track|album|playlist)\/[\w]+/.test(caminho)) {
        return { tipo: 'spotify', url: `https://open.spotify.com${caminho}` };
      }
    }
    if (
      ['www.youtube.com', 'youtube.com', 'm.youtube.com'].includes(u.hostname)
    ) {
      const id = u.searchParams.get('v');
      if (id) return { tipo: 'youtube', url: `https://www.youtube.com/watch?v=${id}` };
    }
    if (u.hostname === 'youtu.be' && u.pathname.length > 1) {
      return {
        tipo: 'youtube',
        url: `https://www.youtube.com/watch?v=${u.pathname.slice(1).split('/')[0]}`,
      };
    }
  } catch {
    // URL malformada — cai no return null
  }
  return null;
}

export default function EtapaMusica({
  musica,
  onChange,
}: {
  musica: Musica | null;
  onChange: (musica: Musica | null) => void;
}) {
  const [texto, setTexto] = useState(musica?.url ?? '');
  const invalida = texto.trim() !== '' && !musica;

  function aoDigitar(valor: string) {
    setTexto(valor);
    onChange(interpretarUrlMusica(valor));
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl text-center mb-2">
        A música de vocês 🎵
      </h1>
      <p className="text-center text-sm text-paper/60 mb-6">
        Cole um link do Spotify ou do YouTube. Esta etapa é opcional —
        pode pular se quiser.
      </p>

      <input
        value={texto}
        onChange={(e) => aoDigitar(e.target.value)}
        placeholder="https://open.spotify.com/track/…  ou  https://youtu.be/…"
        inputMode="url"
        className="w-full rounded-xl bg-plum border border-paper/15 px-4 py-3 outline-none focus:border-gold"
      />

      {invalida && (
        <p className="text-rose text-sm text-center">
          Não reconhecemos esse link. Use um link de faixa do Spotify ou de
          vídeo do YouTube.
        </p>
      )}

      {musica && (
        <div className="rounded-xl bg-plum border border-paper/15 p-4">
          <p className="text-xs uppercase tracking-widest text-gold mb-3">
            Prévia — assim ela aparece na retrospectiva
          </p>
          {musica.tipo === 'spotify' ? (
            <iframe
              src={musica.url.replace(
                'open.spotify.com/',
                'open.spotify.com/embed/'
              )}
              width="100%"
              height="152"
              allow="encrypted-media"
              className="rounded-xl"
            />
          ) : (
            <iframe
              src={musica.url.replace('watch?v=', 'embed/')}
              width="100%"
              height="200"
              allow="autoplay; encrypted-media"
              className="rounded-xl"
            />
          )}
          <button
            type="button"
            onClick={() => {
              setTexto('');
              onChange(null);
            }}
            className="mt-3 text-sm text-paper/50 hover:text-rose transition"
          >
            ✕ remover música
          </button>
        </div>
      )}
    </div>
  );
}
