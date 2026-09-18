import type { Metadata } from 'next';
import { Instrument_Serif, Nunito_Sans } from 'next/font/google';
import './globals.css';

const display = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-display',
});

const body = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

const title = 'Nossa Retro — a retrospectiva do seu amor';
const description =
  'Transforme a história de vocês em uma retrospectiva animada, com fotos, momentos e a música de vocês. O presente digital que ninguém esquece.';

// Ícones e imagem de compartilhamento vêm dos arquivos em app/
// (favicon.ico, icon.png, apple-icon.png, opengraph-image.png).
export const metadata: Metadata = {
  // Sem isso a og:image sai com URL relativa e WhatsApp/Google ignoram
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title,
  description,
  applicationName: 'Nossa Retro',
  openGraph: {
    title,
    description,
    siteName: 'Nossa Retro',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title, description },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${display.variable} ${body.variable} font-body bg-ink text-paper antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
