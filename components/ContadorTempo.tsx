'use client';

import { useEffect, useState } from 'react';

type Partes = {
  anos: number;
  meses: number;
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
};

function calcular(dataInicio: string): Partes {
  const inicio = new Date(dataInicio + 'T00:00:00');
  const agora = new Date();

  let anos = agora.getFullYear() - inicio.getFullYear();
  let meses = agora.getMonth() - inicio.getMonth();
  let dias = agora.getDate() - inicio.getDate();

  if (dias < 0) {
    meses -= 1;
    // dias no mês anterior ao atual
    dias += new Date(agora.getFullYear(), agora.getMonth(), 0).getDate();
  }
  if (meses < 0) {
    anos -= 1;
    meses += 12;
  }

  return {
    anos,
    meses,
    dias,
    horas: agora.getHours(),
    minutos: agora.getMinutes(),
    segundos: agora.getSeconds(),
  };
}

export default function ContadorTempo({ dataInicio }: { dataInicio: string }) {
  const [partes, setPartes] = useState<Partes | null>(null);

  useEffect(() => {
    // calculado só no client para evitar mismatch de hidratação
    setPartes(calcular(dataInicio));
    const t = setInterval(() => setPartes(calcular(dataInicio)), 1000);
    return () => clearInterval(t);
  }, [dataInicio]);

  if (!partes) {
    return <div className="h-16" aria-hidden />;
  }

  const blocos: Array<[number, string]> = [
    [partes.anos, partes.anos === 1 ? 'ano' : 'anos'],
    [partes.meses, partes.meses === 1 ? 'mês' : 'meses'],
    [partes.dias, partes.dias === 1 ? 'dia' : 'dias'],
    [partes.horas, 'h'],
    [partes.minutos, 'min'],
    [partes.segundos, 's'],
  ];

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-5 font-display text-gold">
      {blocos.map(([valor, rotulo]) => (
        <div key={rotulo} className="text-center">
          <div className="text-3xl sm:text-4xl tabular-nums text-glow-gold">
            {String(valor).padStart(2, '0')}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-paper/50 font-body">
            {rotulo}
          </div>
        </div>
      ))}
    </div>
  );
}
