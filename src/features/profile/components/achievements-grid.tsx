import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Lock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AchievementProgress {
  id: string;
  type: string;
  title: string;
  description: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt: Date | null;
}

interface AchievementsGridProps {
  achievements: AchievementProgress[];
}

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-primary">Progreso total</p>
          <p className="text-xs text-muted-foreground">
            {unlockedCount} de {achievements.length} desbloqueados
          </p>
        </div>
        <Badge className="bg-primary text-primary-foreground">
          {achievements.length > 0
            ? Math.round((unlockedCount / achievements.length) * 100)
            : 0}
          %
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {achievements.map((achievement) => (
          <Card
            key={achievement.id}
            className={cn(
              "overflow-hidden transition-colors",
              achievement.unlocked
                ? "border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(57,255,20,0.08)]"
                : "glass border-border/60 opacity-75"
            )}
          >
            <CardContent className="flex gap-3 p-4">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                  achievement.unlocked
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {achievement.unlocked ? (
                  <Check className="h-5 w-5" strokeWidth={3} />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      "font-semibold leading-tight",
                      achievement.unlocked && "text-primary"
                    )}
                  >
                    {achievement.title}
                  </p>
                  <Badge
                    variant={achievement.unlocked ? "default" : "outline"}
                    className="shrink-0 text-[10px]"
                  >
                    +{achievement.xpReward} XP
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {achievement.description}
                </p>
                {achievement.unlocked && achievement.unlockedAt ? (
                  <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-primary">
                    <Trophy className="h-3 w-3" />
                    Desbloqueado · {formatDate(achievement.unlockedAt)}
                  </p>
                ) : (
                  <p className="mt-2 text-[11px] text-muted-foreground">Bloqueado</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
