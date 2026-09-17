"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinTournament } from "@/actions/tournament-actions";
import { KeyRound } from "lucide-react";

export function JoinTournamentCard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await joinTournament(formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      if (result.tournamentId) {
        toast.success("¡Te uniste al torneo!");
        router.push(`/tournaments/${result.tournamentId}/select-team`);
      }
    });
  }

  return (
    <div className="rounded-3xl border border-border bg-gradient-to-b from-[#161616] to-[#0d0d0d] p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary/85">
            Invitación
          </p>
          <h2 className="text-base font-semibold">Unirse con código</h2>
        </div>
      </div>
      <form action={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="joinCode" className="text-xs text-muted-foreground">
            Código que te compartieron
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="joinCode"
              name="joinCode"
              placeholder="PL-XXXXXX"
              required
              minLength={6}
              className="h-12 rounded-2xl font-mono text-lg uppercase tracking-[0.28em]"
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
