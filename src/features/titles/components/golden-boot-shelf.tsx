import { GoldenBootAward } from "@/features/titles/components/golden-boot-award";
import type { TrophyWithTournament } from "@/features/titles/lib/title-utils";
import { TrophyService } from "@/services/trophy-service";

export async function GoldenBootShelf({
  boots,
}: {
  boots: TrophyWithTournament[];
}) {
  if (boots.length === 0) return null;

  const faces = await TrophyService.goldenBootFaces(boots);

  return (
    <section className="overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-b from-[#1a1408] via-[#100e0a] to-[#0b0b0b]">
      <div className="border-b border-amber-500/15 px-4 py-3 sm:px-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-amber-300/90">
          Premios individuales
        </p>
        <h2 className="text-base font-semibold sm:text-lg">Botas de oro</h2>
        <p className="text-xs text-muted-foreground">
          Cara, goles y equipo del jugador que más anotó. No cuenta como título.
        </p>
      </div>
      <div className="flex flex-col gap-3 p-3 sm:p-4">
        {faces.map((face) => (
          <GoldenBootAward
            key={face.id}
            playerName={face.playerName}
            portraitUrl={face.portraitUrl}
            goals={face.goals}
            crestUrl={face.crestUrl}
            clubName={face.faceClubName}
            tournamentName={
              face.tournament?.name ??
              face.title.replace(/^Bota de Oro\s*·\s*/i, "")
            }
            tournamentId={face.tournament?.id ?? face.tournamentId}
          />
        ))}
      </div>
    </section>
  );
}
