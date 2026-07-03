import { ReactNode } from "react";
import { ChevronLeft, Menu } from "lucide-react";
import { Button } from "../../../ui/button";

export function AppLayout({
  children,
  title,
  showBack = false,
  action,
}: {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="flex justify-center bg-zinc-950 min-h-[100dvh] p-4 sm:p-8 font-sans">
      <div className="relative w-full max-w-[400px] h-[850px] max-h-[100dvh] bg-[#FFFBF5] sm:rounded-[40px] sm:shadow-2xl overflow-hidden flex flex-col sm:border-[8px] border-zinc-900">
        
        {/* Header */}
        <header className="flex-none px-6 pt-12 pb-4 flex items-center justify-between bg-[#FFFBF5] z-10">
          <div className="flex items-center gap-3">
            {showBack ? (
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-900">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-900">
                <Menu className="h-5 w-5" />
              </Button>
            )}
            {title && <h1 className="text-xl font-medium text-stone-800 tracking-tight">{title}</h1>}
          </div>
          {action && <div>{action}</div>}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto relative scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}
