"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MatchEventsSummary } from "@/features/matches/components/match-events-summary";
import type { EnrichedPlayerStat } from "@/types/match-stats";

interface MatchEventsSummaryLoaderProps {
  playerStats: EnrichedPlayerStat[];
  mvpNickname?: string | null;
  penaltiesHome?: number | null;
  penaltiesAway?: number | null;
}

export function MatchEventsSummaryLoader(props: MatchEventsSummaryLoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="glass">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Cargando detalle del partido…
        </CardContent>
      </Card>
    );
  }

  return <MatchEventsSummary {...props} />;
}
