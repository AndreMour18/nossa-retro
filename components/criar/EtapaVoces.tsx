'use client';

export type DadosVoces = {
  nome_1: string;
  nome_2: string;
  data_inicio: string;
  email_comprador: string;
};

export default function EtapaVoces({
  dados,
  atualizar,
}: {
  dados: DadosVoces;
  atualizar: (patch: Partial<DadosVoces>) => void;
}) {
  function campo(k: keyof DadosVoces) {
    return {
      value: dados[k],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        atualizar({ [k]: e.target.value }),
    };
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl text-center mb-8">
        Vamos começar por vocês
      </h1>

      <label className="block">
        <span className="text-sm text-paper/70">Seu nome</span>
        <input
          {...campo('nome_1')}
          placeholder="Ana"
          className="mt-1 w-full rounded-xl bg-plum border border-paper/15 px-4 py-3 outline-none focus:border-gold"
        />
      </label>

      <label className="block">
        <span className="text-sm text-paper/70">
          O nome de quem vai receber
        </span>
        <input
          {...campo('nome_2')}
          placeholder="Léo"
          className="mt-1 w-full rounded-xl bg-plum border border-paper/15 px-4 py-3 outline-none focus:border-gold"
        />
      </label>

      <label className="block">
        <span className="text-sm text-paper/70">Quando tudo começou</span>
        <input
          type="date"
          {...campo('data_inicio')}
          className="mt-1 w-full rounded-xl bg-plum border border-paper/15 px-4 py-3 outline-none focus:border-gold"
        />
      </label>

      <label className="block">
        <span className="text-sm text-paper/70">
          Seu e-mail (para enviarmos o link)
        </span>
        <input
          type="email"
          {...campo('email_comprador')}
          placeholder="voce@email.com"
          className="mt-1 w-full rounded-xl bg-plum border border-paper/15 px-4 py-3 outline-none focus:border-gold"
        />
      </label>
    </div>
  );
}
