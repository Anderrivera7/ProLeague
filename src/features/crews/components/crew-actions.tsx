"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, LogOut, Share2, Trash2 } from "lucide-react";
import { leaveCrew, deleteCrew } from "@/actions/crew-actions";

interface CrewActionsProps {
  crewId: string;
  joinCode: string;
  isOwner: boolean;
  memberCount: number;
}

export function CrewActions({
  crewId,
  joinCode,
  isOwner,
  memberCount,
}: CrewActionsProps) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function copyCode() {
    await navigator.clipboard.writeText(joinCode);
    setCopied(true);
    toast.success("Código copiado");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleLeave() {
    if (!confirm("¿Seguro que quieres salir de este grupo?")) return;
    startTransition(async () => {
      try {
        const result = await leaveCrew(crewId);
        if (result?.error) toast.error(result.error);
      } catch {
        /* redirect */
      }
    });
  }

  function handleDelete() {
    if (
      !confirm("¿Eliminar el grupo? Todos los miembros perderán el acceso.")
    ) {
      return;
    }
    startTransition(async () => {
      try {
        const result = await deleteCrew(crewId);
        if (result?.error) toast.error(result.error);
      } catch {
        /* redirect */
      }
    });
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-[#161616] via-[#111] to-[#0b0b0b]">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary/85">
              Invitar amigos
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Comparte el código para que se unan al grupo
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copyCode}
              className="group inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2.5 transition-colors hover:bg-primary/15"
            >
              <span className="font-mono text-lg font-bold tracking-[0.28em] text-primary">
                {joinCode}
              </span>
              {copied ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4 text-primary/70 group-hover:text-primary" />
              )}
            </button>
            <Badge variant="outline" className="text-muted-foreground">
              {memberCount} {memberCount === 1 ? "miembro" : "miembros"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLeave}
            disabled={isPending}
            className="rounded-full"
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Salir
          </Button>
          {isOwner && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Eliminar
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
