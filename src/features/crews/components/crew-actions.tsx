"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy, Check, LogOut, Trash2 } from "lucide-react";
import { leaveCrew, deleteCrew } from "@/actions/crew-actions";

interface CrewActionsProps {
  crewId: string;
  joinCode: string;
  isOwner: boolean;
}

export function CrewActions({ crewId, joinCode, isOwner }: CrewActionsProps) {
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
      !confirm(
        "¿Eliminar el grupo? Todos los miembros perderán el acceso."
      )
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
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={copyCode}>
        {copied ? (
          <Check className="mr-1 h-3.5 w-3.5" />
        ) : (
          <Copy className="mr-1 h-3.5 w-3.5" />
        )}
        Código: <span className="ml-1 font-mono">{joinCode}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLeave}
        disabled={isPending}
      >
        <LogOut className="mr-1 h-3.5 w-3.5" />
        Salir
      </Button>
      {isOwner && (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          Eliminar grupo
        </Button>
      )}
    </div>
  );
}
