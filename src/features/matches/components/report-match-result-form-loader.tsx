"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ReportMatchResultForm } from "@/features/matches/components/report-match-result-form";

type PlayerSide = {
  userId: string;
  nickname: string;
  teamName: string;
  crestUrl: string | null;
  side: "home" | "away";
  squad: { id: string; name: string }[];
};

interface ReportMatchResultFormLoaderProps {
  matchId: string;
  players: [PlayerSide, PlayerSide];
}

export function ReportMatchResultFormLoader(
  props: ReportMatchResultFormLoaderProps
) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="glass">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Cargando formulario…
        </CardContent>
      </Card>
    );
  }

  return <ReportMatchResultForm {...props} />;
}
