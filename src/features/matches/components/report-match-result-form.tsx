"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recordMatchResult } from "@/actions/match-actions";
import { Plus, Trash2 } from "lucide-react";

interface SquadPlayer {
  id: string;
  name: string;
}

interface PlayerSide {
  userId: string;
  nickname: string;
  teamName: string;
  crestUrl: string | null;
  side: "home" | "away";
  squad: SquadPlayer[];
}

interface PlayerEntry {
  key: string;
  fcPlayerId: string;
  count: number;
}

interface ReportMatchResultFormProps {
  matchId: string;
  players: [PlayerSide, PlayerSide];
}

function newEntry(): PlayerEntry {
  return { key: crypto.randomUUID(), fcPlayerId: "", count: 1 };
}

function TeamCrest({
  name,
  crestUrl,
  size = 40,
}: {
  name: string;
  crestUrl: string | null;
  size?: number;
}) {
  if (crestUrl) {
    return (
      <Image
        src={crestUrl}
        alt={name}
        width={size}
        height={size}
        className="object-contain"
        unoptimized
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-primary/20 font-bold text-primary"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function parseCount(value: string): number {
  if (value === "") return 0;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? 0 : Math.max(0, n);
}

function TeamStatSection({
  title,
  entries,
  squad,
  onChange,
}: {
  title: string;
  entries: PlayerEntry[];
  squad: SquadPlayer[];
  onChange: (entries: PlayerEntry[]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{title}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onChange([...entries, newEntry()])}
        >
          <Plus className="mr-1 h-3 w-3" />
          Añadir
        </Button>
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">Sin registros</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.key} className="flex gap-2">
              <select
                value={entry.fcPlayerId}
                onChange={(e) =>
                  onChange(
                    entries.map((x) =>
                      x.key === entry.key
                        ? { ...x, fcPlayerId: e.target.value }
                        : x
                    )
                  )
                }
                className="flex h-9 flex-1 rounded-lg border border-border bg-card px-2 text-sm"
              >
                <option value="">Jugador...</option>
                {squad.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                min={0}
                value={entry.count}
                onChange={(e) =>
                  onChange(
                    entries.map((x) =>
                      x.key === entry.key
                        ? { ...x, count: parseCount(e.target.value) }
                        : x
                    )
                  )
                }
                className="h-9 w-14 text-center px-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() =>
                  onChange(entries.filter((x) => x.key !== entry.key))
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamStatsPanel({
  player,
  goals,
  yellows,
  reds,
  onGoalsChange,
  onYellowsChange,
  onRedsChange,
}: {
  player: PlayerSide;
  goals: PlayerEntry[];
  yellows: PlayerEntry[];
  reds: PlayerEntry[];
  onGoalsChange: (e: PlayerEntry[]) => void;
  onYellowsChange: (e: PlayerEntry[]) => void;
  onRedsChange: (e: PlayerEntry[]) => void;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <TeamHeader player={player} />
      <TeamStatSection
        title="Goles"
        entries={goals}
        squad={player.squad}
        onChange={onGoalsChange}
      />
      <TeamStatSection
        title="Amarillas"
        entries={yellows}
        squad={player.squad}
        onChange={onYellowsChange}
      />
      <TeamStatSection
        title="Rojas"
        entries={reds}
        squad={player.squad}
        onChange={onRedsChange}
      />
    </div>
  );
}

function mergeEntries(
  userId: string,
  goals: PlayerEntry[],
  yellows: PlayerEntry[],
  reds: PlayerEntry[]
) {
  const map = new Map<
    string,
    { fcPlayerId: string; userId: string; goals: number; yellowCards: number; redCards: number; ownGoals: number }
  >();

  const add = (
    entries: PlayerEntry[],
    field: "goals" | "yellowCards" | "redCards"
  ) => {
    for (const e of entries) {
      if (!e.fcPlayerId || e.count <= 0) continue;
      const existing = map.get(e.fcPlayerId) ?? {
        fcPlayerId: e.fcPlayerId,
        userId,
        goals: 0,
        yellowCards: 0,
        redCards: 0,
        ownGoals: 0,
      };
      existing[field] += e.count;
      map.set(e.fcPlayerId, existing);
    }
  };

  add(goals, "goals");
  add(yellows, "yellowCards");
  add(reds, "redCards");

  return Array.from(map.values());
}

function sumGoals(entries: PlayerEntry[]) {
  return entries
    .filter((e) => e.fcPlayerId && e.count > 0)
    .reduce((sum, e) => sum + e.count, 0);
}

function TeamHeader({ player }: { player: PlayerSide }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <TeamCrest name={player.teamName} crestUrl={player.crestUrl} size={44} />
      <p className="text-lg font-bold">{player.teamName}</p>
      <p className="text-xs text-muted-foreground">{player.nickname}</p>
    </div>
  );
}

export function ReportMatchResultForm({
  matchId,
  players,
}: ReportMatchResultFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [homePlayer, awayPlayer] = players;

  const [homeGoals, setHomeGoals] = useState<PlayerEntry[]>([]);
  const [awayGoals, setAwayGoals] = useState<PlayerEntry[]>([]);
  const [homeYellows, setHomeYellows] = useState<PlayerEntry[]>([]);
  const [awayYellows, setAwayYellows] = useState<PlayerEntry[]>([]);
  const [homeReds, setHomeReds] = useState<PlayerEntry[]>([]);
  const [awayReds, setAwayReds] = useState<PlayerEntry[]>([]);
  const [penaltiesHome, setPenaltiesHome] = useState(0);
  const [penaltiesAway, setPenaltiesAway] = useState(0);
  const [mvpUserId, setMvpUserId] = useState("");

  const homeScore = useMemo(() => sumGoals(homeGoals), [homeGoals]);
  const awayScore = useMemo(() => sumGoals(awayGoals), [awayGoals]);
  const isDraw = homeScore === awayScore;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (homeScore === 0 && awayScore === 0) {
      toast.error("Añade al menos un gol a algún jugador");
      return;
    }

    startTransition(async () => {
      const playerStats = [
        ...mergeEntries(homePlayer.userId, homeGoals, homeYellows, homeReds),
        ...mergeEntries(awayPlayer.userId, awayGoals, awayYellows, awayReds),
      ];

      const formData = new FormData();
      formData.set("matchId", matchId);
      formData.set("homeScore", String(homeScore));
      formData.set("awayScore", String(awayScore));
      if (isDraw) {
        formData.set("penaltiesHome", String(penaltiesHome));
        formData.set("penaltiesAway", String(penaltiesAway));
      }
      if (mvpUserId) formData.set("mvpUserId", mvpUserId);
      formData.set("playerStats", JSON.stringify(playerStats));

      const result = await recordMatchResult(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Resultado registrado");
        router.push(`/matches/${matchId}`);
        router.refresh();
      }
    });
  }

  return (
    <Card className="glass border-primary/30">
      <CardHeader>
        <CardTitle className="text-base">Registrar resultado</CardTitle>
        <p className="text-xs text-muted-foreground">
          Victoria +3 pts · Empate +1 · Derrota 0 · MVP +1 extra
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-center gap-6">
            <TeamHeader player={homePlayer} />
            <div className="flex items-center gap-3 rounded-xl bg-muted px-6 py-3 font-mono text-3xl font-bold">
              <span>{homeScore}</span>
              <span className="text-muted-foreground text-xl">—</span>
              <span>{awayScore}</span>
            </div>
            <TeamHeader player={awayPlayer} />
          </div>

          {isDraw && homeScore > 0 && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium text-center">Penales (opcional)</p>
              <div className="flex items-center justify-center gap-4">
                <Input
                  type="number"
                  min={0}
                  value={penaltiesHome}
                  onChange={(e) =>
                    setPenaltiesHome(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="h-10 w-16 text-center"
                />
                <span className="text-muted-foreground">—</span>
                <Input
                  type="number"
                  min={0}
                  value={penaltiesAway}
                  onChange={(e) =>
                    setPenaltiesAway(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="h-10 w-16 text-center"
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <TeamStatsPanel
              player={homePlayer}
              goals={homeGoals}
              yellows={homeYellows}
              reds={homeReds}
              onGoalsChange={setHomeGoals}
              onYellowsChange={setHomeYellows}
              onRedsChange={setHomeReds}
            />
            <TeamStatsPanel
              player={awayPlayer}
              goals={awayGoals}
              yellows={awayYellows}
              reds={awayReds}
              onGoalsChange={setAwayGoals}
              onYellowsChange={setAwayYellows}
              onRedsChange={setAwayReds}
            />
          </div>

          <div className="space-y-2">
            <Label>MVP del partido (+1 pt extra)</Label>
            <div className="flex flex-wrap gap-2">
              {players.map((p) => (
                <Button
                  key={p.userId}
                  type="button"
                  size="sm"
                  variant={mvpUserId === p.userId ? "default" : "outline"}
                  onClick={() =>
                    setMvpUserId(mvpUserId === p.userId ? "" : p.userId)
                  }
                  className="gap-2"
                >
                  <TeamCrest name={p.teamName} crestUrl={p.crestUrl} size={20} />
                  {p.teamName}
                </Button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar resultado"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
