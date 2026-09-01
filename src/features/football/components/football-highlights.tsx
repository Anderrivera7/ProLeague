import Image from "next/image";
import { Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScorebatHighlight } from "@/lib/sports-apis/scorebat-client";

interface Props {
  highlights: ScorebatHighlight[];
}

export function FootballHighlights({ highlights }: Props) {
  if (highlights.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Play className="h-4 w-4 text-primary" />
            Highlights del fútbol real
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Añade{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            SCOREBAT_API_TOKEN
          </code>{" "}
          en tu <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code>{" "}
          para ver goles y resúmenes de{" "}
          <a
            href="https://www.scorebat.com/video-api/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Scorebat
          </a>
          .
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Play className="h-4 w-4 text-primary" />
          Highlights · Scorebat
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {highlights.map((item) => (
          <div
            key={item.matchviewUrl}
            className="overflow-hidden rounded-lg border border-border"
          >
            {item.videos[0]?.embed ? (
              <div
                className="aspect-video w-full [&>div]:h-full [&>div]:w-full"
                dangerouslySetInnerHTML={{ __html: item.videos[0].embed }}
              />
            ) : item.thumbnail ? (
              <Image
                src={item.thumbnail}
                alt={item.title}
                width={400}
                height={225}
                className="aspect-video w-full object-cover"
                unoptimized
              />
            ) : null}
            <div className="p-3">
              <p className="text-sm font-medium leading-tight">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.competition} · {item.date}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
