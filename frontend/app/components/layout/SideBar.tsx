"use client"

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  CreditCard,
  Settings,
  Clock,
  User,
  Star,
  LogOut,
  ChevronDown,
  Bot,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/lib/utils";
import { useSidebar } from "./SidebarContext";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", shortLabel: "Home", href: "/home" },
  { icon: Calendar, label: "Agenda", shortLabel: "Agenda", href: "/agenda" },
  { icon: Users, label: "Alunos", shortLabel: "Alunos", href: "/students" },
  { icon: CreditCard, label: "Mensalidades", shortLabel: "Mensal.", href: "/mensalidades" },
  { icon: Bot, label: "Automacoes", shortLabel: "Bot", href: "/automations" },
  {
    icon: Settings,
    label: "Configuracoes",
    shortLabel: "Config.",
    href: "/settings",
    mobileHref: "/settings/schedule",
    submenu: [
      { icon: Clock, label: "Horarios", href: "/settings/schedule" },
      { icon: User, label: "Perfil", href: "/settings/profile" },
      { icon: Star, label: "Minha Assinatura", href: "/settings/subscription" },
    ]
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isHovered, setHovered } = useSidebar();
  const { data: session } = useSession();
  const [isMobile, setIsMobile] = useState(false);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // No desktop, a sidebar expande quando isHovered é true
  const isExpanded = !isMobile && isHovered;

  const handleMouseEnter = () => {
    if (!isMobile) {
      setHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setHovered(false);
    }
  };

  // Mobile: render bottom navigation bar
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border h-16 pb-safe">
        <div className="flex items-center justify-around h-full px-1">
          {sidebarItems.map((item) => {
            const href = item.mobileHref || item.href;
            const isActive = pathname === item.href ||
              (item.mobileHref && pathname.startsWith("/settings")) ||
              item.submenu?.some(sub => pathname === sub.href);

            return (
              <Link
                key={item.label}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1 rounded-lg transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-tight truncate">
                  {item.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  // Desktop: render sidebar
  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 overflow-x-hidden",
        isExpanded ? "w-64" : "w-[4.5rem]"
      )}
    >
      {/* Header */}
      <div className={cn(
        "h-16 flex items-center border-b border-sidebar-border/50 transition-all duration-300",
        isExpanded ? "px-6" : "px-4 justify-center"
      )}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className={cn(
            "font-bold text-lg font-[family-name:var(--font-heading)] tracking-wider text-sidebar-foreground transition-all duration-300 overflow-hidden whitespace-nowrap",
            isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
          )}>
            PLANNFLY
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden flex flex-col justify-start lg:pt-24 pt-12 space-y-2 transition-all duration-300",
        isExpanded ? "px-3" : "px-2"
      )}>
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || item.submenu?.some(sub => pathname === sub.href);

          if (item.submenu) {
            if (!isExpanded) {
              return (
                <div key={item.label} className="relative group">
                  <Link
                    href={item.submenu[0].href}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    title={item.label}
                  >
                    <item.icon className="w-5 h-5" />
                  </Link>
                  {/* Tooltip for collapsed state */}
                  <div className="absolute left-full top-0 ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {item.label}
                  </div>
                </div>
              );
            }

            return (
              <Collapsible key={item.label} defaultOpen={isActive} className="group/collapsible">
                <CollapsibleTrigger asChild>
                  <button className={cn(
                    "w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-colors mb-1",
                    "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}>
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-9 space-y-1">
                  {item.submenu.map((subItem) => (
                    <Link key={subItem.href} href={subItem.href} className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                        pathname === subItem.href
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}>
                        {subItem.label}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          return (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-xl text-sm font-medium transition-all",
                  isExpanded ? "justify-between px-3 py-3" : "justify-center p-3",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                title={!isExpanded ? item.label : undefined}
              >
                <div className={cn(
                  "flex items-center",
                  isExpanded ? "gap-3" : ""
                )}>
                  <item.icon className="w-5 h-5" />
                  <span className={cn(
                    "transition-all duration-300 overflow-hidden whitespace-nowrap",
                    isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
                  )}>
                    {item.label}
                  </span>
                </div>
              </Link>
              {/* Tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-full top-0 ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className={cn(
        "p-4 border-t border-sidebar-border",
        !isExpanded && "p-2"
      )}>
        <div className={cn(
          "flex items-center rounded-xl hover:bg-white/5 transition-colors cursor-pointer",
          isExpanded ? "gap-3 px-2 py-2" : "justify-center p-2"
        )}>
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "Avatar"}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-sidebar-foreground/70" />
            </div>
          )}
          <div className={cn(
            "flex-1 min-w-0 transition-all duration-300 overflow-hidden",
            isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
          )}>
            <p className="text-sm font-medium text-sidebar-foreground/70 truncate">
              {session?.user?.name || "Professor"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 flex-shrink-0 transition-all duration-300",
              isExpanded ? "w-8 opacity-100" : "w-0 opacity-0 overflow-hidden"
            )}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
