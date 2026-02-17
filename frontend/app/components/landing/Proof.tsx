"use client";

import { LottieAnimation } from "./LottieAnimation";

export function Proof() {
  const items = [
    "Aluno perguntando \"tem aula hoje?\"",
    "Remarcação de última hora",
    "Horários espalhados em conversa de WhatsApp",
    "Confirmação manual toda semana",
    "Mensagens fora do horário"
  ];

  return (
    <section id="problema" className="bg-foreground text-background py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-16">

          <h2 className="text-4xl md:text-6xl font-[family-name:var(--font-heading)] font-bold text-center tracking-tight text-white mb-8">
            Se sua rotina é assim, isso é pra você
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <ul className="flex flex-col gap-6">
              {items.map((item, index) => (
                <li key={index} className="flex items-start gap-6 group">
                  <div className="mt-1.5 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(124,58,237,0.8)] group-hover:scale-125 transition-transform duration-300" />
                  </div>
                  <span className="text-xl md:text-3xl font-light text-white/90 group-hover:text-white transition-colors">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-center">
              <div className="relative w-full max-w-[400px] aspect-square">
                <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
                <LottieAnimation
                  path="/assets/agenda.json"
                  className="w-full h-full object-contain relative z-10"
                />
              </div>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-white/10">
            <p className="text-xl md:text-2xl text-accent font-medium tracking-wide">
              Se você se identificou com pelo menos dois, continue lendo.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
