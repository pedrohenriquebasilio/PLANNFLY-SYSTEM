"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Bot, Smartphone, CheckCircle, Loader2, X } from "lucide-react";
import api from "@/app/lib/api";

type SessionStatus = "STOPPED" | "STARTING" | "SCAN_QR_CODE" | "WORKING";

interface WahaStatusResponse {
  status: SessionStatus;
  phone?: string;
}

interface WahaQrResponse {
  qr: string | null;
}

export default function AutomationsPage() {
  // WhatsApp connection state
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("STOPPED");
  const [connectedPhone, setConnectedPhone] = useState<string | undefined>();

  // QR modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch WAHA session status on mount ────────────────────────────────────
  useEffect(() => {
    api
      .get<WahaStatusResponse>("/waha/status")
      .then(({ data }) => {
        setSessionStatus(data.status);
        setConnectedPhone(data.phone);
      })
      .catch(() => {});
  }, []);

  // ── Polling helpers ────────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();

    const poll = async () => {
      // Poll QR
      try {
        const { data } = await api.get<WahaQrResponse>("/waha/qr");
        if (data.qr) {
          setQrCode(data.qr);
          setLoadingQr(false);
        }
      } catch {
        // ignore
      }

      // Poll status
      try {
        const { data } = await api.get<WahaStatusResponse>("/waha/status");
        setSessionStatus(data.status);
        if (data.status === "WORKING") {
          setConnectedPhone(data.phone);
          stopPolling();
          setShowQrModal(false);
        }
      } catch {
        // ignore
      }
    };

    pollingRef.current = setInterval(poll, 3000);
  }, [stopPolling]);

  // Stop polling when modal closes
  useEffect(() => {
    if (!showQrModal) {
      stopPolling();
      setQrCode(null);
      setLoadingQr(false);
    }
  }, [showQrModal, stopPolling]);

  // Cleanup on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  // ── Connect ────────────────────────────────────────────────────────────────
  const handleConnect = async () => {
    setShowQrModal(true);
    setLoadingQr(true);
    setQrCode(null);
    try {
      await api.post("/waha/connect");
    } catch {
      // session may already exist — continue anyway
    }
    startPolling();
  };

  // ── Disconnect ─────────────────────────────────────────────────────────────
  const handleDisconnect = async () => {
    try {
      await api.delete("/waha/disconnect");
    } catch {
      // ignore
    }
    setSessionStatus("STOPPED");
    setConnectedPhone(undefined);
  };

  // ── Cancel QR modal ────────────────────────────────────────────────────────
  const handleCancelModal = async () => {
    stopPolling();
    setShowQrModal(false);
    try {
      await api.delete("/waha/disconnect");
    } catch {
      // ignore
    }
    setSessionStatus("STOPPED");
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const isConnected = sessionStatus === "WORKING";

  const statusBadge = isConnected ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Conectado
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
      Desconectado
    </span>
  );

  return (
    <DashboardLayout title="Automacoes" breadcrumb="Automacoes">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Page title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Automacoes
              </h1>
              <p className="text-sm text-muted-foreground">
                Configure a integracao com WhatsApp para a v1 do Plannfly
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp connection card */}
        <Card className="border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">WhatsApp</h3>
            </div>
            {statusBadge}
          </div>

          <div className="p-6">
            {isConnected ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Conectado com sucesso</p>
                    {connectedPhone && (
                      <p className="text-sm text-muted-foreground">+{connectedPhone}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/5"
                  onClick={handleDisconnect}
                >
                  Desconectar
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-sm">Conecte seu WhatsApp</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Conecte seu celular para ativar as automacoes de agendamento.
                  </p>
                </div>
                <Button
                  className="bg-gradient-primary hover:opacity-90 transition-opacity text-white shadow-lg shadow-primary/25 border-0 whitespace-nowrap"
                  onClick={handleConnect}
                >
                  Conectar WhatsApp
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* QR Code modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Conectar WhatsApp</h2>
              <button
                onClick={handleCancelModal}
                className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-5">
              Abra o WhatsApp no seu celular, va em{" "}
              <strong>Aparelhos Conectados</strong> e escaneie o QR code abaixo.
            </p>

            <div className="flex items-center justify-center min-h-[260px] bg-muted/30 rounded-xl border border-border">
              {loadingQr || !qrCode ? (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-sm">Gerando QR Code...</span>
                </div>
              ) : (
                <img
                  src={qrCode}
                  alt="WhatsApp QR Code"
                  className="w-56 h-56 rounded-lg"
                />
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-3">
              O QR Code expira em breve. Escaneie rapidamente.
            </p>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={handleCancelModal}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
