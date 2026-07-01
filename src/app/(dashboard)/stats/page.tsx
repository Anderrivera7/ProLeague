import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsRepository } from "@/repositories/stats-repository";
import { STAT_CATEGORIES } from "@/constants";
import {
  Target,
  Handshake,
  Medal,
  Crown,
  Gamepad2,
  Shield,
  Flame,
  ShieldCheck,
  Zap,
} from "lucide-react";

const iconMap = {
  Target,
  Handshake,
  Medal,
  Crown,
  Gamepad2,
  Shield,
  Flame,
  ShieldCheck,
  Zap,
};

export default async function StatsPage() {
  const [topScorers, topAssists, mostWins, eloRanking] = await Promise.all([
    StatsRepository.getTopScorers(10),
    StatsRepository.getTopAssists(10),
    StatsRepository.getMostWins(10),
    StatsRepository.getEloRanking(10),
  ]);

  const sections = [
    { title: "Top Goleadores", data: topScorers, stat: "goles" },
    { title: "Top Asistencias", data: topAssists, stat: "asistencias" },
    {
      title: "Más Victorias",
      data: mostWins.map((s, i) => ({
        rank: i + 1,
        userId: s.userId,
        nickname: s.user.nickname,
        avatarUrl: s.user.avatarUrl,
        value: s.wins,
      })),
      stat: "victorias",
    },
    {
      title: "Ranking ELO",
      data: eloRanking.map((u, i) => ({
        rank: i + 1,
        userId: u.id,
        nickname: u.nickname,
        avatarUrl: u.avatarUrl,
        value: u.elo,
      })),
      stat: "ELO",
    },
  ];

  return (
    <>
      <Header title="Estadísticas" subtitle="Líderes de la comunidad" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {STAT_CATEGORIES.map((cat) => {
            const Icon = iconMap[cat.icon as keyof typeof iconMap];
            return (
              <Badge key={cat.key} variant="outline" className="gap-1 py-1.5">
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </Badge>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <Card key={section.title} className="glass">
              <CardHeader>
                <CardTitle className="text-base">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {section.data.length > 0 ? (
                  section.data.map((entry) => (
                    <div
                      key={entry.userId}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="w-6 text-muted-foreground font-mono">
                        {entry.rank}
                      </span>
                      <span className="flex-1 font-medium truncate">
                        {entry.nickname}
                      </span>
                      <Badge variant="outline">
                        {entry.value} {section.stat}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Sin datos
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
