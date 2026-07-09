import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14101E',      // fundo noite
        plum: '#241B36',     // superfícies
        gold: '#E8B45A',     // luz de vela (acento principal)
        rose: '#F2A6B3',     // detalhe romântico
        paper: '#FBF6EE',    // texto sobre escuro
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
