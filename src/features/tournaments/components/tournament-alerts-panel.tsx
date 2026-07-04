"use client";

import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface TournamentAlert {
  id: string;
  type: "red" | "yellow" | "info";
  title: string;
  description: string;
  timeAgo?: string;
}

interface TournamentAlertsPanelProps {
  alerts: TournamentAlert[];
}

const alertStyles = {
  red: {
    icon: "bg-red-600",
    badge: "text-red-400",
    label: "Tarjeta roja",
  },
  yellow: {
    icon: "bg-yellow-400",
    badge: "text-yellow-400",
    label: "Tarjetas amarillas",
  },
  info: {
    icon: "bg-blue-500",
    badge: "text-blue-400",
    label: "Información",
  },
};

export function TournamentAlertsPanel({ alerts }: TournamentAlertsPanelProps) {
  return (
    <Card className="glass h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Avisos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.length > 0 ? (
          alerts.map((alert) => {
            const style = alertStyles[alert.type];
            return (
              <div
                key={alert.id}
                className="flex gap-3 rounded-xl border border-border/60 bg-card/40 p-3"
              >
                {alert.type === "info" ? (
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      style.icon
                    )}
                  >
                    <Info className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <span
                    className={cn(
                      "mt-1 h-5 w-3.5 shrink-0 rounded-sm shadow-sm",
                      style.icon
                    )}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{alert.title}</p>
                    {alert.timeAgo && (
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {alert.timeAgo}
                      </span>
                    )}
                  </div>
                  <p className={cn("text-xs font-medium", style.badge)}>
                    {style.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {alert.description}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sin avisos por ahora
          </p>
        )}
      </CardContent>
    </Card>
  );
}
