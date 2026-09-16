"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinCrew } from "@/actions/crew-actions";
import { KeyRound } from "lucide-react";

export function JoinCrewCard() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await joinCrew(formData);
        if (result?.error) {
          setError(result.error);
          toast.error(result.error);
        }
      } catch (e) {
        if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) {
          return;
        }
        toast.error("No se pudo unir al grupo");
      }
    });
  }

  return (
    <div className="rounded-3xl border border-border bg-gradient-to-b from-[#161616] to-[#0d0d0d] p-5 sm:p-6">
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="joinCode"
            className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Código de invitación
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="joinCode"
              name="joinCode"
              placeholder="ABC123"
              required
              minLength={6}
              maxLength={6}
              className="h-12 rounded-2xl font-mono text-lg uppercase tracking-[0.35em]"
            />
            <Button
              type="submit"
              disabled={isPending}
              className="h-12 shrink-0 rounded-2xl px-6"
            >
              {isPending ? "Entrando..." : "Unirme"}
            </Button>
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </div>
  );
}
