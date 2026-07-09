'use client';

const MAX_CARACTERES = 400;

/**
 * Última etapa: a mensagem final (vira a tela de encerramento) e um resumo
 * do que foi montado antes de abrir a prévia.
 */
export default function EtapaMensagem({
  mensagem,
  onChange,
  resumo,
}: {
  mensagem: string;
  onChange: (mensagem: string) => void;
  resumo: { fotos: number; momentos: number; temMusica: boolean };
}) {
  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl text-center mb-2">
        A mensagem final 💛
      </h1>
      <p className="text-center text-sm text-paper/60 mb-6">
        É a última tela da retrospectiva — aquele arremate que fica na
        memória.
      </p>

      <div>
        <textarea
          value={mensagem}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Obrigado por cada segundo. Que venham todos os próximos contadores."
          rows={5}
          maxLength={MAX_CARACTERES}
          className="w-full rounded-xl bg-plum border border-paper/15 px-4 py-3 outline-none focus:border-gold resize-none"
        />
        <p className="mt-1 text-right text-xs text-paper/40">
          {mensagem.length}/{MAX_CARACTERES}
        </p>
      </div>

      <div className="rounded-xl bg-plum border border-paper/15 p-4">
        <p className="text-xs uppercase tracking-widest text-gold mb-3">
          Sua retrospectiva até aqui
        </p>
        <ul className="space-y-1 text-sm text-paper/80">
          <li>
            📷 {resumo.fotos} foto{resumo.fotos === 1 ? '' : 's'}
          </li>
          <li>
            ✨ {resumo.momentos} momento{resumo.momentos === 1 ? '' : 's'}
          </li>
          <li>🎵 {resumo.temMusica ? 'Música escolhida' : 'Sem música'}</li>
        </ul>
      </div>
    </div>
  );
}
