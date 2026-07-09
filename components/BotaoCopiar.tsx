'use client';

import { useState } from 'react';

export default function BotaoCopiar({
  texto,
  rotulo = 'Copiar',
  className = '',
}: {
  texto: string;
  rotulo?: string;
  className?: string;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      // Fallback para contextos sem clipboard API (http, webviews antigos)
      const area = document.createElement('textarea');
      area.value = texto;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className={
        className ||
        'rounded-full bg-gold text-ink font-semibold px-5 py-2 hover:brightness-110 transition'
      }
    >
      {copiado ? 'Copiado ✓' : rotulo}
    </button>
  );
}
