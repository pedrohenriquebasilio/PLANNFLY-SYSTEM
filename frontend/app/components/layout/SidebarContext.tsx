"use client"

import { createContext, useContext, useState, useCallback } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  isHovered: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  setHovered: (hovered: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const toggle = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const open = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  const close = useCallback(() => {
    setIsCollapsed(true);
  }, []);

  const setHovered = useCallback((hovered: boolean) => {
    setIsHovered(hovered);
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, isHovered, toggle, open, close, setHovered }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
