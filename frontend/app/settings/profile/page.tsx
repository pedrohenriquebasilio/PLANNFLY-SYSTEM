"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { User, Mail, Calendar, Pencil, Check, Loader2, Info } from "lucide-react";
import api from "@/app/lib/api";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get<{ data: UserProfile }>("/users/me");
        const user = res.data.data;
        setProfile(user);
        setEditName(user.name);
      } catch {
        // silently fail - will show fallback UI
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSaveName() {
    if (!editName.trim() || editName.trim().length < 2) return;
    setSaving(true);
    try {
      const res = await api.patch<{ data: UserProfile }>("/users/me", {
        name: editName.trim(),
      });
      setProfile(res.data.data);
      setIsEditing(false);
    } catch {
      // keep editing state on error
    } finally {
      setSaving(false);
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  }

  const userName = profile?.name || session?.user?.name || "Professor";
  const userEmail = profile?.email || session?.user?.email || "";
  const userImage = session?.user?.image;
  const memberSince = profile?.createdAt ? formatDate(profile.createdAt) : "";

  return (
    <DashboardLayout title="Perfil" breadcrumb="Configuracoes / Perfil">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-foreground">
            Meu Perfil
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize e edite suas informacoes de perfil
          </p>
        </div>

        {/* Profile Card */}
        <Card className="border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2 bg-card">
            <User className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Informacoes Pessoais</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                {/* Avatar */}
                {userImage ? (
                  <Image
                    src={userImage}
                    alt={userName}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 space-y-4 text-center sm:text-left">
                  {/* Name */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Nome</p>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="max-w-xs h-10"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveName();
                            if (e.key === "Escape") {
                              setIsEditing(false);
                              setEditName(profile?.name || "");
                            }
                          }}
                        />
                        <Button
                          size="icon"
                          className="h-10 w-10 bg-gradient-primary hover:opacity-90 transition-opacity text-white border-0"
                          onClick={handleSaveName}
                          disabled={saving || editName.trim().length < 2}
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-medium">{userName}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => setIsEditing(true)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Email & Member Since */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                        <Mail className="w-4 h-4" />
                        Email
                      </p>
                      <p className="font-medium">{userEmail}</p>
                    </div>
                    {memberSince && (
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                          <Calendar className="w-4 h-4" />
                          Membro desde
                        </p>
                        <p className="font-medium capitalize">{memberSince}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Info */}
        <Card className="border-border shadow-sm p-6 bg-muted/30">
          <div className="flex items-center gap-2 justify-center">
            <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Sua foto e email sao gerenciados pela sua conta Google.
              O nome pode ser alterado a qualquer momento.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
