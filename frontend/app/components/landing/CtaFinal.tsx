"use client";

import { Button } from "@/app/components/ui/button";
import { ArrowRight } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5531982366026";

export function CtaFinal() {
  return (
    <section id="contato" className="bg-foreground text-background py-40 min-h-[90vh] flex items-center justify-center relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-12 text-center">

          <h2 className="text-5xl md:text-7xl font-[family-name:var(--font-heading)] font-bold tracking-tighter text-white leading-tight">
            Quer saber se isso <br/> resolve seu problema?
          </h2>

          <p className="text-xl md:text-2xl text-white/70 font-light max-w-2xl">
            Converse com um representante, explique sua rotina e veja se o Plannfly faz sentido pra você.
          </p>

          <div className="flex flex-col items-center gap-6 pt-4">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-primary hover:bg-secondary text-white text-xl px-12 py-9 rounded-2xl shimmer-bg relative overflow-hidden group transition-all duration-300 transform hover:scale-105 shadow-[0_0_40px_rgba(124,58,237,0.4)]"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Falar com um representante
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </a>

            <p className="text-white/40 text-sm tracking-widest uppercase font-medium">
              Sem teste grátis. Sem enrolação. Só uma conversa honesta.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
