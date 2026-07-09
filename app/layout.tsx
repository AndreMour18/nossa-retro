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

export const metadata: Metadata = {
  title: 'Nossa Retro — a retrospectiva do seu amor',
  description:
    'Transforme a história de vocês em uma retrospectiva animada, com fotos, momentos e a música de vocês. O presente digital que ninguém esquece.',
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
