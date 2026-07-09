-- Rode este script no SQL Editor do Supabase

create table if not exists retrospectivas (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  email_comprador text not null,
  nome_1 text not null,
  nome_2 text not null,
  data_inicio date not null,
  momentos jsonb not null default '[]',
  fotos jsonb not null default '[]',
  musica jsonb,
  mensagem_final text not null default '',
  status text not null default 'rascunho'
    check (status in ('rascunho', 'aguardando_pagamento', 'paga')),
  payment_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_retrospectivas_slug on retrospectivas (slug);
create index if not exists idx_retrospectivas_status_created
  on retrospectivas (status, created_at);

-- RLS: ninguém lê/escreve direto pelo client anon.
-- Toda escrita passa pelas API routes (service role).
alter table retrospectivas enable row level security;

-- Storage: crie um bucket público chamado "fotos" no painel
-- (Storage > New bucket > public). O upload é feito pela API route
-- com service role; a leitura é pública via URL.

-- Limpeza de rascunhos abandonados (rode via cron do Supabase ou manualmente):
-- delete from retrospectivas
--   where status != 'paga' and created_at < now() - interval '7 days';
