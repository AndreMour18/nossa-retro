'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ContadorTempo from './ContadorTempo';
import type { Retrospectiva } from '@/lib/types';

/**
 * Player estilo "story": telas verticais navegadas por toque.
 * Toque na metade direita avança, esquerda volta.
 *
 * A retrospectiva começa travada numa capa "toque para abrir" — isso é
 * proposital: interação do usuário é o que desbloqueia autoplay de
 * áudio/embeds no mobile.
 */

type Slide =
  | { tipo: 'capa' }
  | { tipo: 'contador' }
  | { tipo: 'foto'; url: string; legenda?: string; data?: string }
  | { tipo: 'momento'; titulo: string; texto: string; data?: string }
  | { tipo: 'musica' }
  | { tipo: 'final' };

export default function StoryPlayer({ retro }: { retro: Retrospectiva }) {
  const slides = useMemo<Slide[]>(() => {
    const s: Slide[] = [{ tipo: 'capa' }, { tipo: 'contador' }];
    for (const f of retro.fotos) s.push({ tipo: 'foto', ...f });
    for (const m of retro.momentos) s.push({ tipo: 'momento', ...m });
    if (retro.musica) s.push({ tipo: 'musica' });
    s.push({ tipo: 'final' });
    return s;
  }, [retro]);

  const [i, setI] = useState(0);
  const slide = slides[i];

  function navegar(e: React.MouseEvent<HTMLDivElement>) {
    const meio = e.currentTarget.clientWidth / 2;
    if (e.clientX > meio) {
      setI((v) => Math.min(v + 1, slides.length - 1));
    } else {
      setI((v) => Math.max(v - 1, 0));
    }
  }

  return (
    <div
      className="night-sky h-dvh w-full overflow-hidden select-none cursor-pointer relative"
      onClick={navegar}
      role="button"
      aria-label="Toque para avançar na retrospectiva"
    >
      {/* Barra de progresso */}
      <div className="absolute top-3 left-3 right-3 z-10 flex gap-1">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={`h-0.5 flex-1 rounded-full transition-colors ${
              idx <= i ? 'bg-gold' : 'bg-paper/20'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="h-full flex flex-col items-center justify-center px-8 text-center"
        >
          {slide.tipo === 'capa' && (
            <>
              <p className="uppercase tracking-[0.3em] text-xs text-rose mb-4">
                uma retrospectiva de
              </p>
              <h1 className="font-display text-5xl text-gold text-glow-gold">
                {retro.nome_1} <em>&amp;</em> {retro.nome_2}
              </h1>
              <p className="mt-10 text-paper/60 animate-pulse">
                toque para abrir ❤️
              </p>
            </>
          )}

          {slide.tipo === 'contador' && (
            <>
              <p className="font-display text-3xl mb-6">
                Juntos há exatamente…
              </p>
              <ContadorTempo dataInicio={retro.data_inicio} />
              <p className="mt-8 text-paper/50 text-sm">
                …e contando, segundo a segundo.
              </p>
            </>
          )}

          {slide.tipo === 'foto' && (
            <figure className="max-w-sm w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.url}
                alt={slide.legenda ?? 'Foto do casal'}
                className="w-full rounded-2xl shadow-2xl shadow-black/50 rotate-[-1.5deg]"
              />
              {(slide.legenda || slide.data) && (
                <figcaption className="mt-4 font-display text-xl text-paper/90">
                  {slide.legenda}
                  {slide.data && (
                    <span className="block text-sm text-rose font-body mt-1">
                      {slide.data}
                    </span>
                  )}
                </figcaption>
              )}
            </figure>
          )}

          {slide.tipo === 'momento' && (
            <>
              {slide.data && (
                <p className="text-rose text-sm tracking-widest uppercase mb-3">
                  {slide.data}
                </p>
              )}
              <h2 className="font-display text-4xl text-gold mb-4">
                {slide.titulo}
              </h2>
              <p className="max-w-sm text-paper/80 leading-relaxed">
                {slide.texto}
              </p>
            </>
          )}

          {slide.tipo === 'musica' && retro.musica && (
            <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <p className="font-display text-3xl mb-6">A nossa música 🎵</p>
              {retro.musica.tipo === 'spotify' ? (
                <iframe
                  src={retro.musica.url.replace(
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
                  src={retro.musica.url.replace('watch?v=', 'embed/')}
                  width="100%"
                  height="200"
                  allow="autoplay; encrypted-media"
                  className="rounded-xl"
                />
              )}
              <p className="mt-4 text-xs text-paper/40">
                toque fora do player para continuar
              </p>
            </div>
          )}

          {slide.tipo === 'final' && (
            <>
              <p className="font-display italic text-3xl text-paper leading-snug max-w-sm">
                “{retro.mensagem_final}”
              </p>
              <p className="mt-8 text-gold font-display text-2xl">
                — {retro.nome_1}
              </p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
