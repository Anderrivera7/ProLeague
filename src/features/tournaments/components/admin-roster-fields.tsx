"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { getFcTeams } from "@/actions/tournament-actions";

export type RosterUser = {
  id: string;
  nickname: string;
  avatarUrl: string | null;
};

type RosterTeam = {
  id: string;
  name: string;
};

export type RosterSeat = {
  userId: string;
  fcTeamId: string;
};

export function AdminRosterFields({
  currentUserId,
  currentNickname,
  users,
  leagueId,
  seats,
  onChange,
}: {
  currentUserId: string;
  currentNickname: string;
  users: RosterUser[];
  leagueId: string;
  seats: RosterSeat[];
  onChange: (seats: RosterSeat[]) => void;
}) {
  const [teams, setTeams] = useState<RosterTeam[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!leagueId) return;
    let cancel = false;
    setLoading(true);
    getFcTeams(leagueId, "", 200)
      .then((rows) => {
        if (cancel) return;
        setTeams(rows.map((team) => ({ id: team.id, name: team.name })));
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [leagueId]);

  function update(index: number, patch: Partial<RosterSeat>) {
    onChange(seats.map((seat, i) => (i === index ? { ...seat, ...patch } : seat)));
  }

  const takenUsers = new Set(seats.map((seat) => seat.userId).filter(Boolean));
  const takenTeams = new Set(seats.map((seat) => seat.fcTeamId).filter(Boolean));

  return (
    <div className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
      <div>
        <Label>Plantel del torneo</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Como admin metes a quien quieras y eliges su equipo. Entran sin
          aceptar. Los cupos vacíos se pueden llenar después con el código.
        </p>
      </div>
      {loading ? (
        <p className="text-xs text-muted-foreground">Cargando equipos...</p>
      ) : null}
      <div className="space-y-2">
        {seats.map((seat, index) => {
          const isCreator = index === 0;
          return (
            <div key={index} className="grid gap-2 sm:grid-cols-2">
              <select
                aria-label={`Jugador ${index + 1}`}
                className="flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm disabled:opacity-80"
                value={isCreator ? currentUserId : seat.userId}
                disabled={isCreator}
                onChange={(event) => update(index, { userId: event.target.value })}
              >
                {isCreator ? (
                  <option value={currentUserId}>{currentNickname} (tú)</option>
                ) : (
                  <option value="">Jugador {index + 1}</option>
                )}
                {users
                  .filter(
                    (user) =>
                      user.id !== currentUserId &&
                      (user.id === seat.userId || !takenUsers.has(user.id))
                  )
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nickname}
                    </option>
                  ))}
              </select>
              <select
                aria-label={`Equipo del jugador ${index + 1}`}
                className="flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
                value={seat.fcTeamId}
                onChange={(event) =>
                  update(index, { fcTeamId: event.target.value })
                }
              >
                <option value="">Equipo</option>
                {teams
                  .filter(
                    (team) =>
                      team.id === seat.fcTeamId || !takenTeams.has(team.id)
                  )
                  .map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function rosterPayload(seats: RosterSeat[], currentUserId: string) {
  const creator = seats[0];
  const others = seats
    .slice(1)
    .filter((seat) => seat.userId || seat.fcTeamId);
  const creatorChosen = Boolean(creator?.fcTeamId);
  if (!creatorChosen && others.length === 0) return { json: "" as const };
  if (others.some((seat) => !seat.userId || !seat.fcTeamId)) {
    return { error: "Cada jugador del plantel necesita usuario y equipo" };
  }
  if (!creatorChosen) {
    return { error: "Elige también tu equipo" };
  }
  return {
    json: JSON.stringify([
      { userId: currentUserId, fcTeamId: creator.fcTeamId },
      ...others,
    ]),
  };
}
