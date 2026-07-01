import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  nickname: string;
}

export function MobileHeader({ nickname }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-background/90 px-4 py-4 backdrop-blur-md">
      <div>
        <h1 className="text-xl font-bold">
          ¡Hola, {nickname}!{" "}
          <span className="inline-block" aria-hidden>
            ⚽
          </span>
        </h1>
      </div>
      <Button variant="ghost" size="icon" className="relative rounded-full">
        <Bell className="h-5 w-5" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
      </Button>
    </header>
  );
}
