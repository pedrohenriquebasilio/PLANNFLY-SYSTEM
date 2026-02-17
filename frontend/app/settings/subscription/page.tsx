"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Star, Loader2, CalendarDays } from "lucide-react";
import api from "@/app/lib/api";

interface UserSubscription {
  subscriptionStatus: string;
  subscriptionExpiresAt: string | null;
}

export default function SubscriptionPage() {
  const [data, setData] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const res = await api.get<{ data: UserSubscription }>("/users/me");
        setData(res.data.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchSubscription();
  }, []);

  const isActive = data?.subscriptionStatus === "active";

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <DashboardLayout title="Minha Assinatura" breadcrumb="Configuracoes / Minha Assinatura">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-foreground">
            Minha Assinatura
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize o status da sua assinatura
          </p>
        </div>

        {/* Subscription Card */}
        <Card className="border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2 bg-card">
            <Star className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Status da Assinatura</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">Status:</span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {isActive ? "Ativa" : "Inativa"}
                  </span>
                </div>

                {/* Expiration Date */}
                {isActive && data?.subscriptionExpiresAt && (
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Expira em:</span>
                    <span className="text-sm font-medium">
                      {formatDate(data.subscriptionExpiresAt)}
                    </span>
                  </div>
                )}

                {/* Renew Button */}
                <div className="pt-2">
                  <Link href="/subscription">
                    <Button className="bg-gradient-primary hover:opacity-90 transition-opacity text-white shadow-lg shadow-primary/25 border-0">
                      <Star className="w-4 h-4 mr-2" />
                      Renove ja
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
