'use client';

import type { Momento } from '@/lib/types';

export const MAX_MOMENTOS = 6;

const MOMENTO_VAZIO: Momento = { titulo: '', texto: '', data: '' };

/**
 * Etapa de momentos: pequenos capítulos da história (título + texto + data
 * livre). Cada um vira um slide na retrospectiva.
 */
export default function EtapaMomentos({
  momentos,
  onChange,
}: {
  momentos: Momento[];
  onChange: (momentos: Momento[]) => void;
}) {
  // Começa com um cartão em branco para não abrir uma tela vazia
  const lista = momentos.length > 0 ? momentos : [MOMENTO_VAZIO];

  function atualizar(idx: number, patch: Partial<Momento>) {
    onChange(lista.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  }

  function adicionar() {
    if (lista.length >= MAX_MOMENTOS) return;
    onChange([...lista, MOMENTO_VAZIO]);
  }

  function remover(idx: number) {
    onChange(lista.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl text-center mb-2">
        Momentos que marcaram
      </h1>
      <p className="text-center text-sm text-paper/60 mb-6">
        O primeiro “oi”, o pedido, aquela viagem… cada momento vira uma
        tela da retrospectiva.
      </p>

      <ul className="space-y-4">
        {lista.map((momento, idx) => (
          <li
            key={idx}
            className="rounded-xl bg-plum border border-paper/15 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-gold">
                Momento {idx + 1}
              </span>
              {lista.length > 1 && (
                <button
                  type="button"
                  onClick={() => remover(idx)}
                  aria-label={`Remover momento ${idx + 1}`}
                  className="text-paper/50 hover:text-rose transition text-sm"
                >
                  ✕ remover
                </button>
              )}
            </div>

            <input
              value={momento.titulo}
              onChange={(e) => atualizar(idx, { titulo: e.target.value })}
              placeholder="Título (ex.: O primeiro “oi”)"
              className="w-full rounded-lg bg-ink/60 border border-paper/15 px-3 py-2 outline-none focus:border-gold"
            />
            <textarea
              value={momento.texto}
              onChange={(e) => atualizar(idx, { texto: e.target.value })}
              placeholder="Conte em poucas linhas como foi…"
              rows={3}
              maxLength={280}
              className="w-full rounded-lg bg-ink/60 border border-paper/15 px-3 py-2 outline-none focus:border-gold resize-none"
            />
            <input
              value={momento.data ?? ''}
              onChange={(e) => atualizar(idx, { data: e.target.value })}
              placeholder="Quando? (ex.: 14 de novembro de 2022)"
              className="w-full rounded-lg bg-ink/60 border border-paper/15 px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={adicionar}
        disabled={lista.length >= MAX_MOMENTOS}
        className="w-full rounded-xl border-2 border-dashed border-paper/25 py-4 text-paper/70 hover:border-gold hover:text-gold transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {lista.length >= MAX_MOMENTOS
          ? `Limite de ${MAX_MOMENTOS} momentos atingido`
          : '+ Adicionar outro momento'}
      </button>
    </div>
  );
}
