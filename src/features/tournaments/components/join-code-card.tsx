"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface JoinCodeCardProps {
  joinCode: string;
  tournamentName?: string;
}

export function JoinCodeCard({ joinCode, tournamentName }: JoinCodeCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(joinCode);
    setCopied(true);
    toast.success("Código copiado");
    setTimeout(() => setCopied(false), 2000);
  }

  async function shareCode() {
    const text = `¡Únete a ${tournamentName ?? "mi torneo"} en ProLeague! Código: ${joinCode}`;
    if (navigator.share) {
      await navigator.share({ title: "ProLeague", text });
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Invitación copiada");
    }
  }

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
      <p className="text-xs font-medium uppercase tracking-wider text-primary">
        Código del torneo
      </p>
      <p className="mt-2 font-mono text-3xl font-bold tracking-widest text-foreground">
        {joinCode}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Comparte este código para que otros se unan
      </p>
      <div className="mt-4 flex gap-2 justify-center">
        <Button variant="outline" size="sm" onClick={copyCode}>
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          Copiar
        </Button>
        <Button variant="outline" size="sm" onClick={shareCode}>
          <Share2 className="h-4 w-4" />
          Compartir
        </Button>
      </div>
    </div>
  );
}
