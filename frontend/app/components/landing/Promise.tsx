"use client";

import { LottieAnimation } from "./LottieAnimation";

export function Promise() {
  return (
    <section id="solucao" className="bg-background py-32 relative overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Text Content */}
          <div className="flex flex-col gap-8 order-2 lg:order-1">
            <h2 className="text-5xl md:text-7xl font-[family-name:var(--font-heading)] font-bold tracking-tighter text-foreground leading-[1.0]">
              E se sua agenda respondesse sozinha?
            </h2>

            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl">
              O Plannfly centraliza horários, automatiza confirmações e resolve dúvidas básicas dos alunos sem você precisar responder mensagem por mensagem.
            </p>

            <div className="pt-4">
              <p className="text-3xl md:text-4xl font-[family-name:var(--font-heading)] font-semibold text-primary tracking-tight">
                Menos interrupção. Mais foco em dar aula.
              </p>
            </div>
          </div>

          {/* Visual Content */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-full aspect-square max-w-[500px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl" />
              <LottieAnimation
                path="/assets/ai-chatbot.json"
                className="w-full h-full object-contain relative z-10"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
