# Nossa Retro 💛

Micro-SaaS de retrospectiva de relacionamento: o comprador preenche fotos,
datas e a música do casal, paga via Pix e recebe um link + QR code com uma
retrospectiva animada para presentear.

Stack: **Next.js 14 (App Router) · Tailwind · Framer Motion · Supabase ·
Mercado Pago (Pix) · Resend · Vercel**

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha as chaves (veja abaixo)
npm run dev
```

Rotas úteis desde o primeiro `npm run dev` (sem precisar de banco):

- `/` — landing page
- `/r/demo` — retrospectiva de demonstração (dados embutidos no código)
- `/criar` — formulário de criação (etapa 1 pronta, demais em construção)

## Setup dos serviços

### 1. Supabase (banco + fotos)

1. Crie um projeto em [supabase.com](https://supabase.com) (plano gratuito).
2. No **SQL Editor**, rode o conteúdo de `supabase/schema.sql`.
3. Em **Storage**, crie um bucket público chamado `fotos`.
4. Em **Project Settings → API**, copie a URL e as chaves para o `.env.local`.

### 2. Mercado Pago (Pix)

1. Crie uma conta de vendedor e uma aplicação em
   [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers).
2. Use primeiro as **credenciais de teste** para desenvolver, depois troque
   pelas de produção.
3. Copie o Access Token para `MP_ACCESS_TOKEN`.
4. Para testar o webhook localmente, exponha seu localhost com
   `ngrok http 3000` e aponte `NEXT_PUBLIC_APP_URL` para a URL do ngrok.

### 3. Resend (e-mail)

1. Crie conta em [resend.com](https://resend.com) (3 mil e-mails/mês grátis).
2. Verifique seu domínio (SPF/DKIM) para os e-mails não caírem em spam.
3. Copie a API key para `RESEND_API_KEY`.

### 4. Deploy (Vercel)

1. Suba o repositório para o GitHub.
2. Importe na [Vercel](https://vercel.com) e cole as variáveis de ambiente.
3. Aponte `NEXT_PUBLIC_APP_URL` para o domínio final.

## O que já está pronto

- Estrutura completa do projeto e tema visual (noite estrelada + dourado)
- Landing page com o contador ao vivo como demonstração
- `StoryPlayer`: o motor da retrospectiva em formato story (capa, contador,
  fotos, momentos, música via embed, mensagem final), com barra de progresso,
  navegação por toque e respeito a `prefers-reduced-motion`
- Retrospectiva `/r/demo` funcionando com dados embutidos
- Etapa 1 do formulário de criação
- API de checkout Pix (`/api/checkout`) e webhook de confirmação
  (`/api/webhook`) com envio de e-mail de entrega

## Próximos passos (em ordem)

1. **Upload de fotos**: rota `/api/upload` recebendo imagens comprimidas no
   client (`browser-image-compression`) e salvando no bucket `fotos`.
2. **Rascunho**: rota `/api/rascunho` salvando o formulário a cada etapa.
3. **Etapas 2-5 do formulário** (fotos, momentos, música, mensagem).
4. **Preview bloqueado** + tela de checkout com QR code e polling do status.
5. **Página de sucesso** com link, cópia e download do QR code.
6. **Validar assinatura do webhook** do Mercado Pago (`x-signature`).
7. Fotos reais de banco de imagens em `public/demo/` para a `/r/demo`.
8. Página `/privacidade` (LGPD: uso das fotos, exclusão sob pedido).

## Decisões de arquitetura

- **Sem login**: menos fricção; o comprador é identificado pelo e-mail e o
  rascunho é recuperável por link mágico (futuro).
- **RLS ligado, escrita só pelo servidor**: o client nunca fala direto com o
  banco; tudo passa pelas API routes com service role.
- **Links não indexáveis** (`noindex`) e slugs aleatórios de 12 caracteres:
  privacidade por obscuridade forte o suficiente para o caso de uso.
- **Rascunhos expiram em 7 dias**; retrospectivas pagas são permanentes
  (argumento de venda).
