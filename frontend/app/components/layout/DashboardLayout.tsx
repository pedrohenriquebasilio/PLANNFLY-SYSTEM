"use client"

import { useEffect, useState } from "react";
import { cn } from "@/app/lib/utils";
import { Sidebar } from "./SideBar";
import { Header } from "./Header";
import { SidebarProvider } from "./SidebarContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumb?: string;
  className?: string;
}

function DashboardContent({ children, title, breadcrumb, className }: DashboardLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="dark min-h-screen bg-background font-sans flex">
      <Sidebar />
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        isMobile ? "ml-0 pb-16" : "ml-[4.5rem]"
      )}>
        <Header title={title} breadcrumb={breadcrumb} />
        <main className={cn(
          "flex-1",
          isMobile ? "p-4 pt-3" : "p-8 pt-6",
          className
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardContent {...props} />
    </SidebarProvider>
  );
}
