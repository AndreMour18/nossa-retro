import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import StoryPlayer from '@/components/StoryPlayer';
import { supabaseAdmin } from '@/lib/supabase';
import type { Retrospectiva } from '@/lib/types';

// Links de retrospectiva não devem aparecer no Google (privacidade)
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Retrospectiva de demonstração usada na landing e nos vídeos de divulgação.
// TODO: trocar as fotos por imagens de banco (Unsplash/Pexels) em /public.
const DEMO: Retrospectiva = {
  id: 'demo',
  slug: 'demo',
  email_comprador: 'demo@demo.com',
  nome_1: 'Ana',
  nome_2: 'Léo',
  data_inicio: '2022-11-14',
  fotos: [
    { url: '/demo/foto-1.jpg', legenda: 'Nosso primeiro rolê', data: 'nov 2022' },
    { url: '/demo/foto-2.jpg', legenda: 'Aquela viagem 🌊', data: 'jan 2024' },
  ],
  momentos: [
    {
      titulo: 'O primeiro "oi"',
      texto: 'Você respondeu meu story achando que eu não ia ver. Eu vi.',
      data: '14 de novembro de 2022',
    },
    {
      titulo: 'O pedido',
      texto: 'Na praia, com o celular tremendo na mão. Você disse sim antes de eu terminar a frase.',
      data: '3 de junho de 2023',
    },
  ],
  musica: null,
  mensagem_final:
    'Obrigado por cada segundo. Que venham todos os próximos contadores.',
  status: 'paga',
};

export default async function RetrospectivaPage({
  params,
}: {
  params: { slug: string };
}) {
  if (params.slug === 'demo') {
    return <StoryPlayer retro={DEMO} />;
  }

  const { data, error } = await supabaseAdmin()
    .from('retrospectivas')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'paga')
    .single();

  if (error || !data) notFound();

  return <StoryPlayer retro={data as Retrospectiva} />;
}
