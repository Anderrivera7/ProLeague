import Image from "next/image";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: number;
  className?: string;
}

export function AppLogo({ size = 36, className }: AppLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="ProLeague"
      width={size}
      height={size}
      className={cn("object-contain", className)}
      priority
    />
  );
}
