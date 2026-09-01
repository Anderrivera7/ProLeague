"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  confirmMatchResult,
  rejectMatchResult,
} from "@/actions/match-actions";
import { Check, X } from "lucide-react";

interface PendingMatchResultCardProps {
  matchId: string;
  homeScore: number;
  awayScore: number;
  penaltiesHome?: number | null;
  penaltiesAway?: number | null;
  proposedByNickname: string;
  proposedByUserId: string;
  currentUserId: string;
  isCreator: boolean;
  homeTeamName: string;
  awayTeamName: string;
}

export function PendingMatchResultCard({
  matchId,
  homeScore,
  awayScore,
  penaltiesHome,
  penaltiesAway,
  proposedByNickname,
  proposedByUserId,
  currentUserId,
  isCreator,
  homeTeamName,
  awayTeamName,
}: PendingMatchResultCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isProposer = proposedByUserId === currentUserId;
  const canDecide = (!isProposer && currentUserId !== "") || isCreator;

  function handleConfirm() {
    startTransition(async () => {
      const result = await confirmMatchResult(matchId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Resultado confirmado");
      router.refresh();
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await rejectMatchResult(matchId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Resultado rechazado");
      router.refresh();
    });
  }

  return (
    <Card className="glass border-amber-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          Resultado pendiente
          <Badge variant="outline" className="border-amber-500/40 text-amber-400">
            Por confirmar
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Propuesto por <span className="font-medium text-foreground">{proposedByNickname}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-4 rounded-xl bg-muted/40 px-6 py-4 font-mono text-2xl font-bold">
          <span className="text-sm font-sans font-medium text-muted-foreground sm:hidden">
            {homeTeamName.slice(0, 3)}
          </span>
          <span className="hidden text-sm font-sans font-medium text-muted-foreground sm:inline">
            {homeTeamName}
          </span>
          <span>{homeScore}</span>
          <span className="text-muted-foreground">—</span>
          <span>{awayScore}</span>
          <span className="hidden text-sm font-sans font-medium text-muted-foreground sm:inline">
            {awayTeamName}
          </span>
          <span className="text-sm font-sans font-medium text-muted-foreground sm:hidden">
            {awayTeamName.slice(0, 3)}
          </span>
        </div>
        {penaltiesHome != null && penaltiesAway != null && (
          <p className="text-center text-xs text-muted-foreground">
            Penales {penaltiesHome}–{penaltiesAway}
          </p>
        )}

        {isProposer && !isCreator && (
          <p className="text-center text-sm text-muted-foreground">
            Esperando a que tu rival confirme o rechace el marcador.
          </p>
        )}

        {canDecide && (!isProposer || isCreator) && (
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              className="min-w-[140px]"
            >
              <Check className="mr-2 h-4 w-4" />
              Confirmar
            </Button>
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isPending}
              className="min-w-[140px]"
            >
              <X className="mr-2 h-4 w-4" />
              Rechazar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
