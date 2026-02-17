"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  CreditCard,
  ExternalLink,
  LogOut,
  Loader2,
  Check,
  ArrowLeft,
  User,
} from "lucide-react";
import api from "../lib/api";

type PlanType = "monthly" | "quarterly";
type Step = "plans" | "form";

const plans = [
  {
    type: "monthly" as PlanType,
    name: "Mensal",
    price: "R$ 39,90",
    priceDetail: "/mes",
    features: [
      "Gestao de alunos",
      "Controle de agenda",
      "Controle de mensalidades",
      "Dashboard completo",
    ],
  },
  {
    type: "quarterly" as PlanType,
    name: "Trimestral",
    price: "R$ 89,90",
    priceDetail: "/trimestre",
    badge: "Mais popular",
    highlight: true,
    savings: "Economize ~R$ 30",
    features: [
      "Gestao de alunos",
      "Controle de agenda",
      "Controle de mensalidades",
      "Dashboard completo",
    ],
  },
];

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function SubscriptionPage() {
  const [step, setStep] = useState<Step>("plans");
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSelectPlan(planType: PlanType) {
    setSelectedPlan(planType);
    setStep("form");
    setError(null);
  }

  function handleBack() {
    setStep("plans");
    setError(null);
  }

  async function handleCheckout() {
    if (!selectedPlan) return;

    const cpfDigits = cpf.replace(/\D/g, "");
    const phoneDigits = phone.replace(/\D/g, "");

    if (cpfDigits.length !== 11) {
      setError("CPF deve ter 11 digitos.");
      return;
    }
    if (phoneDigits.length < 10) {
      setError("Telefone deve ter pelo menos 10 digitos.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post<{ data: { url: string } }>(
        "/abacatepay/checkout",
        { planType: selectedPlan, cpf: cpfDigits, phone: phoneDigits }
      );
      const checkoutUrl = response.data.data.url;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (err) {
      setError("Erro ao gerar link de pagamento. Tente novamente.");
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  }

  const selectedPlanData = plans.find((p) => p.type === selectedPlan);
  const cpfDigits = cpf.replace(/\D/g, "");
  const phoneDigits = phone.replace(/\D/g, "");
  const isFormValid = cpfDigits.length === 11 && phoneDigits.length >= 10;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        {step === "plans" && (
          <>
            <div className="flex flex-col items-center text-center space-y-6 mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Ative sua assinatura
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                  Escolha o plano ideal para voce e comece a gerenciar suas
                  aulas de forma simples e organizada.
                </p>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center mb-6">{error}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.type}
                  className={`relative p-6 bg-card border-border shadow-sm flex flex-col ${
                    plan.highlight
                      ? "border-primary/50 shadow-md shadow-primary/10"
                      : ""
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-primary text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg shadow-primary/25">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="space-y-4 flex-1">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold tracking-tight text-foreground">
                          {plan.price}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {plan.priceDetail}
                        </span>
                      </div>
                      {plan.savings && (
                        <p className="text-xs text-primary font-medium">
                          {plan.savings}
                        </p>
                      )}
                    </div>

                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => handleSelectPlan(plan.type)}
                    className={`w-full mt-6 h-12 text-base ${
                      plan.highlight
                        ? "bg-gradient-primary hover:opacity-90 transition-opacity text-white shadow-lg shadow-primary/25 border-0"
                        : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                    }`}
                  >
                    Assinar {plan.name}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              ))}
            </div>
          </>
        )}

        {step === "form" && (
          <div className="flex flex-col items-center">
            <Card className="w-full max-w-md p-8 bg-card border-border shadow-sm space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    Vamos terminar seu cadastro!
                  </h2>
                  {selectedPlanData && (
                    <p className="text-sm text-muted-foreground">
                      Plano {selectedPlanData.name} —{" "}
                      {selectedPlanData.price}
                      {selectedPlanData.priceDetail}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    CPF
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                    className="w-full h-10 px-3 rounded-md bg-secondary/50 border border-transparent focus:bg-background focus:border-primary/50 focus:outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Telefone
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="w-full h-10 px-3 rounded-md bg-secondary/50 border border-transparent focus:bg-background focus:border-primary/50 focus:outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleCheckout}
                  disabled={!isFormValid || loading}
                  className="w-full h-12 text-base bg-gradient-primary hover:opacity-90 transition-opacity text-white shadow-lg shadow-primary/25 border-0 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando checkout...
                    </>
                  ) : (
                    <>
                      Continuar para pagamento
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={loading}
                  className="w-full h-10 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para os planos
                </Button>
              </div>
            </Card>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair e usar outra conta
          </button>
        </div>
      </div>
    </div>
  );
}
