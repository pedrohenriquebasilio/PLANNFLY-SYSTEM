"use client";

import { Check } from "lucide-react";
import { LottieAnimation } from "./LottieAnimation";

export function Qualification() {
  const qualifiers = [
    "Dá aulas presenciais ou online",
    "Atende alunos individuais ou em grupo",
    "Quer mais organização e profissionalismo",
    "Está cansado de resolver tudo manualmente"
  ];

  return (
    <section className="bg-background py-32">
      <div className="container mx-auto px-4 md:px-6">

        <h2 className="text-4xl md:text-6xl font-[family-name:var(--font-heading)] font-bold text-center tracking-tight text-foreground mb-16">
          O Plannfly é ideal se você:
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left - Qualifiers (7 cols, offset 1 col) */}
          <div className="lg:col-start-2 lg:col-span-6 flex flex-col gap-6">
            {qualifiers.map((item, index) => (
              <div key={index} className="flex items-center gap-6 p-6 rounded-2xl hover:bg-muted/30 transition-colors border border-transparent hover:border-primary/10">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                  <Check className="w-5 h-5" strokeWidth={3} />
                </div>
                <span className="text-xl md:text-2xl font-medium text-foreground">
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* Right - Animation (4 cols) */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-full max-w-[400px] aspect-square">
              <div className="absolute inset-0 bg-linear-to-tr from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
              <LottieAnimation
                path="/assets/Get things done.json"
                className="w-full h-full object-contain relative z-10 filter-[brightness(1.1)_sepia(0.1)_hue-rotate(270deg)_saturate(1.15)]"
></LottieAnimation>
            </div>
          </div>
        </div>

        <div className="text-center pt-16">
          <div className="inline-block px-8 py-4 bg-muted rounded-full border border-border">
            <p className="text-lg md:text-xl text-muted-foreground font-medium">
              Se você busca só uma agenda simples, <span className="text-foreground font-bold">esse produto não é pra você.</span>
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
