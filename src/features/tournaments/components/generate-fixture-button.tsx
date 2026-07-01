"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateTournamentFixture } from "@/actions/tournament-actions";

interface Props {
  tournamentId: string;
}

export function GenerateFixtureButton({ tournamentId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateTournamentFixture(tournamentId);
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else if ("success" in result && result.success) {
        toast.success(`Fixture generado: ${result.matchCount} partidos`);
      }
    });
  }

  return (
    <Button size="sm" onClick={handleGenerate} disabled={isPending}>
      <Play className="h-4 w-4" />
      {isPending ? "Generando..." : "Generar Fixture"}
    </Button>
  );
}
