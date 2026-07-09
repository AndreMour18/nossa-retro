export type Momento = { titulo: string; texto: string; data?: string };
export type Foto = { url: string; legenda?: string; data?: string };

// Foto ainda no navegador (antes do upload): url é um object URL local e
// file é o arquivo comprimido que será enviado ao /api/upload.
export type FotoForm = Foto & { file?: File };
export type Musica = { tipo: 'spotify' | 'youtube'; url: string; titulo?: string };

export type Retrospectiva = {
  id: string;
  slug: string;
  email_comprador: string;
  nome_1: string;
  nome_2: string;
  data_inicio: string; // ISO date
  momentos: Momento[];
  fotos: Foto[];
  musica: Musica | null;
  mensagem_final: string;
  status: 'rascunho' | 'aguardando_pagamento' | 'paga';
  payment_id?: string | null;
  created_at?: string;
};
