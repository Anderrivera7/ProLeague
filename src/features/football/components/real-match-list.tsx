import Image from "next/image";
import { Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SportsDbEvent } from "@/lib/sports-apis/thesportsdb-client";

interface Props {
  title: string;
  events: SportsDbEvent[];
  variant?: "upcoming" | "recent";
}

function EventRow({
  event,
  variant,
}: {
  event: SportsDbEvent;
  variant: "upcoming" | "recent";
}) {
  const isRecent = variant === "recent";
  const hasScore =
    isRecent && event.homeScore != null && event.awayScore != null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30">
      <div className="flex min-w-0 flex-1 flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          {event.homeBadge && (
            <Image
              src={event.homeBadge}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
              unoptimized
            />
          )}
          <span className="truncate text-sm font-medium">{event.homeTeam}</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1">
        {hasScore ? (
          <span className="rounded-md bg-muted px-3 py-1 font-mono text-sm font-bold">
            {event.homeScore} — {event.awayScore}
          </span>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">vs</span>
        )}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {event.date}
          {event.time && !hasScore && (
            <>
              <Clock className="ml-1 h-3 w-3" />
              {event.time.slice(0, 5)}
            </>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{event.awayTeam}</span>
          {event.awayBadge && (
            <Image
              src={event.awayBadge}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
              unoptimized
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function RealMatchList({ title, events, variant = "upcoming" }: Props) {
  if (events.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Sin partidos disponibles
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {events[0]?.leagueBadge && (
            <Image
              src={events[0].leagueBadge}
              alt={events[0].league}
              width={24}
              height={24}
              className="h-6 w-6 object-contain opacity-80"
              unoptimized
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {events.map((event) => (
          <EventRow key={event.id} event={event} variant={variant} />
        ))}
      </CardContent>
    </Card>
  );
}
