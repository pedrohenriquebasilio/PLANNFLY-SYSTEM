import { Bell, HelpCircle, Sparkles } from "lucide-react";
import { Button } from "@/app/components/ui/button";


export function Header({ title, breadcrumb }: { title: string, breadcrumb?: string }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex flex-col justify-center">
           <div className="flex items-center gap-2 text-sm text-muted-foreground mb-0.5 font-[family-name:var(--font-heading)]">
             <span className="hidden md:inline">Plannfly</span>
             <span className="hidden md:inline">/</span>
             <span className="text-foreground font-semibold">{breadcrumb || title}</span>
           </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <HelpCircle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
          </Button>
          <Button size="icon" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 shadow-none">
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
