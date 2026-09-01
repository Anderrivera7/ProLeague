"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0B0B0B] px-6 text-center text-white">
        <h1 className="text-2xl font-bold text-[#39FF14]">Error crítico</h1>
        <p className="max-w-md text-sm text-zinc-400">
          La aplicación no pudo cargarse. Inténtalo de nuevo.
        </p>
        {error.digest && (
          <p className="text-xs text-zinc-600">Ref: {error.digest}</p>
        )}
        <Button onClick={reset} className="mt-2">
          Reintentar
        </Button>
      </body>
    </html>
  );
}
