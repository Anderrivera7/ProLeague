import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/shared/app-logo";
import { APP_NAME } from "@/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <AppLogo size={48} />
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          404
        </p>
        <h1 className="text-3xl font-bold">Página no encontrada</h1>
        <p className="max-w-md text-muted-foreground">
          La ruta que buscas no existe o ya no está disponible en {APP_NAME}.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/dashboard">Ir al dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Inicio</Link>
        </Button>
      </div>
    </div>
  );
}
