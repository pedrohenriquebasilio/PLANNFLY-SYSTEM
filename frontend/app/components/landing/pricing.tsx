import { Check } from "lucide-react";
import { Button } from "../ui/button";

export function Pricing() {
  const plans = [
    {
      name: "Mensal",
      price: "29,90",
      period: "/mês",
      description: "Ideal para começar a organizar sua rotina.",
      features: [
        "Agendamentos ilimitados",
        "Confirmações automáticas",
        "Gestão de alunos",
        "Suporte via chat"
      ],
      cta: "Assinar Mensal",
      highlighted: false
    },
    {
      name: "Trimestral",
      price: "89,90",
      period: "/trimestre",
      description: "O melhor custo-benefício para sua carreira.",
      features: [
        "Tudo do plano mensal",
        "Prioridade no suporte",
        "Relatórios de produtividade",
        "Desconto progressivo"
      ],
      cta: "Assinar Trimestral",
      highlighted: true
    }
  ];

  return (
    <section className="bg-background py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col gap-6">
          <h2 className="text-4xl md:text-6xl font-[family-name:var(--font-heading)] font-bold tracking-tight text-foreground">
            Planos que cabem no seu bolso
          </h2>
          <p className="text-xl text-muted-foreground font-light">
            Escolha a melhor opção para automatizar sua agenda e focar no que realmente importa: seus alunos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col p-8 md:p-10 rounded-3xl border transition-all duration-500 hover:scale-[1.02] ${
                plan.highlighted
                  ? "bg-foreground border-primary shadow-2xl shadow-primary/20 md:scale-105 z-20"
                  : "bg-card border-border hover:border-primary/30 z-10"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg shadow-primary/40">
                  Mais Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-2xl font-bold mb-4 ${plan.highlighted ? "text-white" : "text-foreground"}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className={`text-sm font-medium ${plan.highlighted ? "text-white/60" : "text-muted-foreground"}`}>R$</span>
                  <span className={`text-5xl md:text-6xl font-[family-name:var(--font-heading)] font-bold ${plan.highlighted ? "text-primary" : "text-foreground"}`}>
                    {plan.price.split(",")[0]}
                  </span>
                  <span className={`text-xl font-medium ${plan.highlighted ? "text-white/60" : "text-muted-foreground"}`}>
                    ,{plan.price.split(",")[1]}
                  </span>
                  <span className={`text-sm font-medium ml-1 ${plan.highlighted ? "text-white/40" : "text-muted-foreground"}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`mt-4 text-sm ${plan.highlighted ? "text-white/60" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              </div>

              {/* Divider */}
              <div className={`h-px mb-8 ${plan.highlighted ? "bg-white/10" : "bg-border"}`} />

              <div className="flex-grow flex flex-col gap-4 mb-10">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlighted ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                      <Check className="w-3 h-3" strokeWidth={4} />
                    </div>
                    <span className={`text-base ${plan.highlighted ? "text-white/80" : "text-foreground/80"}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className={`w-full py-7 text-lg font-bold rounded-2xl transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 shimmer-bg"
                    : "bg-muted hover:bg-primary/10 text-foreground border border-border"
                }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="text-center pt-12">
          <div className="inline-block px-8 py-4 bg-primary/5 rounded-full border border-primary/10">
            <p className="text-sm md:text-base text-muted-foreground font-medium">
              Cancele quando quiser. <span className="text-primary font-bold">Sem fidelidade.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
