"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TournamentBracketPanel } from "@/features/tournaments/components/tournament-bracket-panel";
import type {
  BracketChampion,
  BracketRoundView,
} from "@/lib/tournament-bracket";

interface TournamentBracketLoaderProps {
  rounds: BracketRoundView[];
  champion: BracketChampion;
}

export function TournamentBracketLoader({
  rounds,
  champion,
}: TournamentBracketLoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="glass">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Cargando fixture…
        </CardContent>
      </Card>
    );
  }

  return <TournamentBracketPanel rounds={rounds} champion={champion} />;
}
