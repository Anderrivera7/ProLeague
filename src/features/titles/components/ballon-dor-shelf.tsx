import { BallonDorAward } from "@/features/titles/components/ballon-dor-award";
import type { TrophyWithTournament } from "@/features/titles/lib/title-utils";
import { TrophyService } from "@/services/trophy-service";

export async function BallonDorShelf({
  awards,
}: {
  awards: TrophyWithTournament[];
}) {
  if (awards.length === 0) return null;

  const faces = await TrophyService.goldenBootFaces(awards);

  return (
    <section className="overflow-hidden rounded-3xl border border-[#e2b045]/50 bg-gradient-to-b from-[#3a280c] via-[#1a1408] to-[#0b0b0b] shadow-[0_0_40px_-24px_rgba(226,176,69,0.9)]">
      <div className="border-b border-[#e2b045]/25 px-4 py-3 sm:px-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#ffe3a1]">
          Premios individuales
        </p>
        <h2 className="text-base font-semibold text-[#fff6dd] sm:text-lg">Balón de Oro</h2>
        <p className="text-xs text-[#e7c56b]/80">
          El jugador del torneo. No cuenta como título.
        </p>
      </div>
      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:justify-start sm:p-4">
        {faces.map((face) => (
          <BallonDorAward
            key={face.id}
            playerName={face.playerName}
            portraitUrl={face.portraitUrl}
            goals={face.goals}
            crestUrl={face.crestUrl}
            clubName={face.faceClubName}
            tournamentName={
              face.tournament?.name ??
              face.title.replace(/^Balón de Oro\s*·\s*/i, "")
            }
            tournamentId={face.tournament?.id ?? face.tournamentId}
          />
        ))}
      </div>
    </section>
  );
}
