"use client";

import { useState, useEffect } from "react";

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "01",
      title: "Você define seus horários e regras",
    },
    {
      id: "02",
      title: "O aluno agenda, consulta ou remarca",
    },
    {
      id: "03",
      title: "O sistema confirma e organiza tudo",
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <section id="como-funciona" className="bg-foreground text-background py-32 overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col gap-20 items-center text-center max-w-5xl mx-auto">

          <h2 className="text-4xl md:text-6xl font-[family-name:var(--font-heading)] font-bold tracking-tight text-white max-w-4xl">
            Funciona sem complicação
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative w-full max-w-5xl">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[4rem] left-0 w-full h-[1px] bg-white/5 z-0" />

            {steps.map((step, i) => {
              const isActive = activeStep === i;
              return (
                <div key={i} className="flex flex-col gap-6 items-center relative z-10 group">
                  <div
                    className={`text-7xl md:text-8xl font-[family-name:var(--font-heading)] font-bold transition-all duration-700 ${
                      isActive
                        ? "text-primary opacity-100 scale-110 drop-shadow-[0_0_20px_rgba(124,58,237,0.5)]"
                        : "text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.2)] opacity-30 group-hover:opacity-50"
                    }`}
                  >
                    {step.id}
                  </div>
                  <div className="space-y-4 max-w-[280px]">
                    <h3
                      className={`text-2xl md:text-3xl font-medium transition-all duration-500 ${
                        isActive
                          ? "text-white shimmer-text"
                          : "text-white/60"
                      }`}
                    >
                      {step.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-10">
            <p className="text-xl md:text-3xl text-primary/90 font-medium tracking-wide max-w-3xl mx-auto">
              Você não precisa mudar sua forma de dar aula. <br className="hidden md:block"/>
              <span className="text-white">Só para de perder tempo com burocracia.</span>
            </p>
          </div>

        </div>
      </div>

      <style jsx>{`
        .shimmer-text {
          background: linear-gradient(
            90deg,
            #ffffff 0%,
            #a855f7 50%,
            #ffffff 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerText 2s linear infinite;
        }

        @keyframes shimmerText {
          to {
            background-position: 200% center;
          }
        }
      `}</style>
    </section>
  );
}
