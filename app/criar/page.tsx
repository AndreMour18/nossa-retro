'use client';

import { useEffect, useState } from 'react';
import StoryPlayer from '@/components/StoryPlayer';
import EtapaVoces from '@/components/criar/EtapaVoces';
import EtapaFotos from '@/components/criar/EtapaFotos';
import EtapaMomentos from '@/components/criar/EtapaMomentos';
import EtapaMusica from '@/components/criar/EtapaMusica';
import EtapaMensagem from '@/components/criar/EtapaMensagem';
import TelaPix from '@/components/criar/TelaPix';
import type { FotoForm, Momento, Musica, Retrospectiva } from '@/lib/types';

/**
 * Formulário de criação — fluxo completo em 5 etapas.
 * Fotos sobem para o bucket via /api/upload na hora da seleção; o rascunho
 * é salvo no banco (/api/rascunho) a cada avanço de etapa e o id fica no
 * localStorage para retomar depois.
 *
 * TODO (fase 3): botão da prévia chamar POST /api/checkout → tela de Pix
 * com polling do status.
 */

const ETAPAS = ['Vocês', 'Fotos', 'Momentos', 'Música', 'Mensagem'] as const;
const CHAVE_RASCUNHO = 'nossa-retro-rascunho';
const CHAVE_RASCUNHO_ID = 'nossa-retro-rascunho-id';

type FormCriar = {
  nome_1: string;
  nome_2: string;
  data_inicio: string;
  email_comprador: string;
  fotos: FotoForm[];
  momentos: Momento[];
  musica: Musica | null;
  mensagem_final: string;
};

const FORM_INICIAL: FormCriar = {
  nome_1: '',
  nome_2: '',
  data_inicio: '',
  email_comprador: '',
  fotos: [],
  momentos: [],
  musica: null,
  mensagem_final: '',
};

// O que dá para guardar no navegador entre visitas. Fotos só entram se já
// tiverem URL pública do bucket (object URLs não sobrevivem ao reload).
type Rascunho = FormCriar;

function fotosPersistiveis(fotos: FotoForm[]) {
  return fotos
    .filter((f) => /^https?:\/\//.test(f.url))
    .map(({ file, ...foto }) => foto);
}

function validarEtapa(etapa: number, form: FormCriar): string | null {
  switch (etapa) {
    case 0: {
      if (!form.nome_1.trim() || !form.nome_2.trim())
        return 'Preencha os dois nomes.';
      if (!form.data_inicio) return 'Conta pra gente quando tudo começou.';
      if (form.data_inicio > new Date().toISOString().slice(0, 10))
        return 'A data de início não pode estar no futuro.';
      if (!/^\S+@\S+\.\S+$/.test(form.email_comprador))
        return 'Digite um e-mail válido — é por ele que você recebe o link.';
      return null;
    }
    case 1:
      return form.fotos.length === 0
        ? 'Adicione pelo menos uma foto de vocês.'
        : null;
    case 2: {
      const completos = form.momentos.filter(
        (m) => m.titulo.trim() && m.texto.trim()
      );
      if (completos.length === 0)
        return 'Conte pelo menos um momento (título e texto).';
      const incompletos = form.momentos.some(
        (m) =>
          (m.titulo.trim() || m.texto.trim() || m.data?.trim()) &&
          !(m.titulo.trim() && m.texto.trim())
      );
      return incompletos
        ? 'Tem um momento pela metade — complete o título e o texto, ou remova.'
        : null;
    }
    case 3:
      return null; // música é opcional; o componente só grava links válidos
    case 4:
      return form.mensagem_final.trim().length < 10
        ? 'Capriche na mensagem final — pelo menos 10 caracteres.'
        : null;
    default:
      return null;
  }
}

export default function CriarPage() {
  const [etapa, setEtapa] = useState(0);
  const [form, setForm] = useState<FormCriar>(FORM_INICIAL);
  const [erro, setErro] = useState<string | null>(null);
  const [previewAberta, setPreviewAberta] = useState(false);
  const [retroId, setRetroId] = useState<string | null>(null);
  const [checkoutAberto, setCheckoutAberto] = useState(false);
  const [preparandoCheckout, setPreparandoCheckout] = useState(false);

  function atualizar(patch: Partial<FormCriar>) {
    setErro(null);
    setForm((f) => ({ ...f, ...patch }));
  }

  // Recupera o rascunho salvo no navegador
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_RASCUNHO);
      if (salvo) {
        const rascunho = JSON.parse(salvo) as Partial<Rascunho>;
        setForm((f) => ({ ...f, ...rascunho }));
      }
      setRetroId(localStorage.getItem(CHAVE_RASCUNHO_ID));
    } catch {
      // rascunho corrompido — segue com o formulário em branco
    }
  }, []);

  // Salva o rascunho no navegador a cada mudança
  useEffect(() => {
    const rascunho: Rascunho = { ...form, fotos: fotosPersistiveis(form.fotos) };
    try {
      localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(rascunho));
    } catch {
      // storage cheio/indisponível — sem drama, só não salva
    }
  }, [form]);

  // Melhor esforço: sincroniza o rascunho com o banco a cada avanço de
  // etapa. Se a API falhar, o formulário segue normalmente (os dados
  // continuam no localStorage).
  async function salvarRascunhoNoBanco(dados: FormCriar): Promise<string | null> {
    try {
      const resp = await fetch('/api/rascunho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: retroId ?? undefined,
          ...dados,
          fotos: fotosPersistiveis(dados.fotos),
        }),
      });
      if (resp.ok) {
        const { id } = (await resp.json()) as { id: string };
        setRetroId(id);
        localStorage.setItem(CHAVE_RASCUNHO_ID, id);
        return id;
      }
    } catch {
      // offline/API fora — tenta de novo no próximo avanço
    }
    return null;
  }

  function avancar() {
    const problema = validarEtapa(etapa, form);
    if (problema) {
      setErro(problema);
      return;
    }
    setErro(null);
    void salvarRascunhoNoBanco(form);
    if (etapa < ETAPAS.length - 1) {
      setEtapa((e) => e + 1);
    } else {
      setPreviewAberta(true);
    }
  }

  function voltar() {
    setErro(null);
    setEtapa((e) => Math.max(e - 1, 0));
  }

  // Monta a retrospectiva para a prévia com o que está no formulário
  const retroPreview: Retrospectiva = {
    id: 'preview',
    slug: 'preview',
    email_comprador: form.email_comprador,
    nome_1: form.nome_1 || 'Você',
    nome_2: form.nome_2 || 'Seu amor',
    data_inicio: form.data_inicio || new Date().toISOString().slice(0, 10),
    fotos: form.fotos.map(({ file, ...foto }) => foto),
    momentos: form.momentos.filter((m) => m.titulo.trim() && m.texto.trim()),
    musica: form.musica,
    mensagem_final: form.mensagem_final,
    status: 'rascunho',
  };

  // Garante o rascunho salvo (o checkout precisa do id) e abre o Pix
  async function iniciarCheckout() {
    setPreparandoCheckout(true);
    const id = await salvarRascunhoNoBanco(form);
    setPreparandoCheckout(false);
    if (!id) {
      setErro(
        'Não conseguimos salvar sua retrospectiva agora. Confira sua conexão e tente de novo.'
      );
      setPreviewAberta(false);
      return;
    }
    setCheckoutAberto(true);
  }

  if (checkoutAberto && retroId) {
    return (
      <TelaPix
        retrospectivaId={retroId}
        onVoltar={() => setCheckoutAberto(false)}
      />
    );
  }

  if (previewAberta) {
    return (
      // fixed inset-0 trava a prévia no tamanho exato da janela (sem scroll)
      <div className="fixed inset-0 overflow-hidden">
        <StoryPlayer retro={retroPreview} />
        <div className="fixed bottom-0 inset-x-0 z-20 px-4 pt-10 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-ink via-ink/80 to-transparent">
          <div
            className="w-full max-w-md mx-auto flex gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewAberta(false)}
              className="flex-1 rounded-full border border-paper/25 py-3 hover:bg-paper/10 transition"
            >
              ← Continuar editando
            </button>
            <button
              onClick={iniciarCheckout}
              disabled={preparandoCheckout}
              className="flex-1 rounded-full bg-gold text-ink font-semibold py-3 hover:brightness-110 transition disabled:opacity-60"
            >
              {preparandoCheckout ? 'Preparando…' : 'Pagar e ganhar o link'}
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-paper/40">
            Gostou? O link eterno chega após o pagamento via Pix.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="night-sky min-h-dvh px-6 py-10 flex flex-col items-center">
      {/* Progresso */}
      <div className="w-full max-w-md flex gap-1 mb-10">
        {ETAPAS.map((nome, idx) => (
          <button
            key={nome}
            type="button"
            onClick={() => idx < etapa && (setErro(null), setEtapa(idx))}
            className="flex-1"
            aria-label={`Etapa ${nome}`}
          >
            <div
              className={`h-1 rounded-full ${
                idx <= etapa ? 'bg-gold' : 'bg-paper/15'
              }`}
            />
            <p className="mt-1 text-[10px] text-center uppercase tracking-wider text-paper/40">
              {nome}
            </p>
          </button>
        ))}
      </div>

      <div className="w-full max-w-md flex-1">
        {etapa === 0 && (
          <EtapaVoces
            dados={{
              nome_1: form.nome_1,
              nome_2: form.nome_2,
              data_inicio: form.data_inicio,
              email_comprador: form.email_comprador,
            }}
            atualizar={atualizar}
          />
        )}
        {etapa === 1 && (
          <EtapaFotos
            fotos={form.fotos}
            onChange={(fotos) => atualizar({ fotos })}
            rascunhoId={retroId}
          />
        )}
        {etapa === 2 && (
          <EtapaMomentos
            momentos={form.momentos}
            onChange={(momentos) => atualizar({ momentos })}
          />
        )}
        {etapa === 3 && (
          <EtapaMusica
            musica={form.musica}
            onChange={(musica) => atualizar({ musica })}
          />
        )}
        {etapa === 4 && (
          <EtapaMensagem
            mensagem={form.mensagem_final}
            onChange={(mensagem_final) => atualizar({ mensagem_final })}
            resumo={{
              fotos: form.fotos.length,
              momentos: form.momentos.filter(
                (m) => m.titulo.trim() && m.texto.trim()
              ).length,
              temMusica: !!form.musica,
            }}
          />
        )}
      </div>

      {erro && (
        <p className="w-full max-w-md mt-6 text-center text-rose text-sm">
          {erro}
        </p>
      )}

      {/* Navegação */}
      <div className="w-full max-w-md flex gap-3 mt-6">
        {etapa > 0 && (
          <button
            onClick={voltar}
            className="flex-1 rounded-full border border-paper/25 py-3 hover:bg-paper/10 transition"
          >
            Voltar
          </button>
        )}
        <button
          onClick={avancar}
          className="flex-1 rounded-full bg-gold text-ink font-semibold py-3 hover:brightness-110 transition"
        >
          {etapa === ETAPAS.length - 1 ? 'Ver prévia ✨' : 'Continuar'}
        </button>
      </div>
    </main>
  );
}
