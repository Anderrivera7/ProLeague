import { Badge } from "@/components/ui/badge";
import type { SquadCounts } from "@/lib/fc-data/squad-count-types";
import { formatSquadCounts } from "@/lib/fc-data/squad-count-types";

interface SquadCountBadgesProps {
  counts: SquadCounts;
  compact?: boolean;
}

export function SquadCountBadges({ counts, compact }: SquadCountBadgesProps) {
  if (compact) {
    return (
      <span className="text-[10px] text-muted-foreground">
        {formatSquadCounts(counts)}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Badge variant="secondary" className="text-[10px]">
        {counts.total} jugadores
      </Badge>
      {counts.starters > 0 && (
        <Badge variant="outline" className="text-[10px]">
          {counts.starters} tit
        </Badge>
      )}
      {counts.substitutes > 0 && (
        <Badge variant="outline" className="text-[10px]">
          {counts.substitutes} sup
        </Badge>
      )}
      {counts.reserves > 0 && (
        <Badge variant="outline" className="text-[10px]">
          {counts.reserves} res
        </Badge>
      )}
    </div>
  );
}
