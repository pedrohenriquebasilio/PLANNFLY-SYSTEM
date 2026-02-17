"use client";

import { Calendar, MessageSquare, Repeat, GraduationCap, Brain } from "lucide-react";
import { LottieAnimation } from "./LottieAnimation";

export function Benefits() {
  const benefits = [
    { icon: Calendar, text: "Sua agenda organizada automaticamente" },
    { icon: MessageSquare, text: "Menos mensagens repetidas no WhatsApp" },
    { icon: Repeat, text: "Remarcações sem confusão" },
    { icon: GraduationCap, text: "Aluno sabe quando é a próxima aula" },
    { icon: Brain, text: "Menos estresse no dia a dia" }
  ];

  return (
    <section id="beneficios" className="bg-background py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-24 items-center">

            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-6 group ${index === benefits.length - 1 ? 'md:col-span-2 md:justify-center' : ''}`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                    <benefit.icon className="w-8 h-8" />
                  </div>
                  <span className="text-2xl md:text-3xl font-medium text-foreground pt-3 group-hover:text-primary transition-colors">
                    {benefit.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="lg:col-span-2 flex justify-center">
              <div className="relative w-full max-w-112.5 aspect-square">
                <div className="absolute inset-0 bg-linear-to-tr from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                <LottieAnimation
                  path="/assets/meditation.json"
                  className="w-full h-full object-contain relative z-10"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
