"use client";

import { Button } from "@/app/components/ui/button";
import { LottieAnimation } from "./LottieAnimation";
import { ArrowRight } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5531982366026";

export function Hero() {
  return (
    <section id="inicio" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background py-20">
      {/* Dynamic Gradient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[50%] bg-accent/15 blur-[100px] rounded-full animate-pulse [animation-delay:1s]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[30%] bg-primary/10 blur-[130px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col gap-8 text-left">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-[family-name:var(--font-heading)] font-bold tracking-tighter text-foreground leading-[0.95] text-balance">
              Quantas mensagens sobre horário você respondeu hoje?
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl text-balance leading-relaxed">
              O <span className="text-primary font-medium">Plannfly</span> automatiza agendamentos, confirma aulas e responde dúvidas básicas dos alunos — pra você parar de perder tempo com agenda e WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start pt-4">
              <div className="flex flex-col items-center sm:items-start gap-3">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-secondary text-white text-lg px-8 py-8 rounded-2xl shimmer-bg relative overflow-hidden group transition-all duration-300 transform hover:scale-105 shadow-xl shadow-primary/20"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Falar com um representante
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </a>
                <span className="text-sm text-muted-foreground/80 font-medium tracking-wide">
                  Conversa rápida. Sem compromisso.
                </span>
              </div>
            </div>
          </div>

          {/* Visual Content */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="relative w-full aspect-[9/16] max-w-[400px] lg:max-w-full">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
              <LottieAnimation
                path="/assets/checking-phone.json"
                className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
