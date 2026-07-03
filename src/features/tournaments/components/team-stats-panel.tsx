import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamStatsPanelProps {
  name: string;
  overall?: number | null;
  attack?: number | null;
  midfield?: number | null;
  defense?: number | null;
  leagueName?: string | null;
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold text-primary">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
          style={{ width: `${Math.min(value, 99)}%` }}
        />
      </div>
    </div>
  );
}

export function TeamStatsPanel({
  name,
  overall,
  attack,
  midfield,
  defense,
  leagueName,
}: TeamStatsPanelProps) {
  const stats = [
    { label: "Ataque", value: attack },
    { label: "Mediocampo", value: midfield },
    { label: "Defensa", value: defense },
  ].filter((s) => s.value != null) as { label: string; value: number }[];

  return (
    <Card className="glass overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary/40" />
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>{name}</CardTitle>
            {leagueName && (
              <p className="mt-1 text-sm text-muted-foreground">{leagueName}</p>
            )}
          </div>
          {overall != null && (
            <Badge className="text-lg px-3 py-1">{overall} OVR</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.length > 0 ? (
          stats.map((stat) => (
            <StatBar key={stat.label} label={stat.label} value={stat.value} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Stats no disponibles. Ejecuta el scraper de FIFA Index.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
