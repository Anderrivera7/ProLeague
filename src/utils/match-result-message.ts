type MatchForMessage = {
  homeScore: number | null;
  awayScore: number | null;
  homeParticipant: {
    user: { nickname: string };
    fcTeam: { name: string } | null;
  };
  awayParticipant: {
    user: { nickname: string };
    fcTeam: { name: string } | null;
  };
};

export function buildMatchResultMessage(match: MatchForMessage): string | null {
  if (match.homeScore == null || match.awayScore == null) return null;

  const homeName =
    match.homeParticipant.fcTeam?.name ?? match.homeParticipant.user.nickname;
  const awayName =
    match.awayParticipant.fcTeam?.name ?? match.awayParticipant.user.nickname;

  if (match.homeScore === match.awayScore) {
    return `Empate: ${homeName} ${match.homeScore}-${match.awayScore} ${awayName}`;
  }

  const homeWon = match.homeScore > match.awayScore;
  const winner = homeWon ? homeName : awayName;
  const loser = homeWon ? awayName : homeName;
  return `${winner} le ganó a ${loser} ${match.homeScore}-${match.awayScore}`;
}
