"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  searchTeamsAction,
  syncTeamAction,
  syncTeamByIdAction,
} from "@/server-actions/team-actions";

export const teamKeys = {
  all: ["teams"] as const,
  search: (query: string, leagueId?: string) =>
    [...teamKeys.all, "search", query, leagueId] as const,
  detail: (id: string) => [...teamKeys.all, "detail", id] as const,
  ea: (eaId: string) => [...teamKeys.all, "ea", eaId] as const,
};

export function useSearchTeams(
  query: string,
  leagueId?: string,
  enabled = true
) {
  return useQuery({
    queryKey: teamKeys.search(query, leagueId),
    queryFn: async () => {
      const result = await searchTeamsAction(query, leagueId, true);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    enabled: enabled && query.length >= 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSyncTeamById(teamId: string, enabled = true) {
  return useQuery({
    queryKey: teamKeys.detail(teamId),
    queryFn: async () => {
      const result = await syncTeamByIdAction(teamId);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    enabled: enabled && !!teamId,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });
}

export function useSyncTeamByEaId() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eaId: string) => {
      const result = await syncTeamAction(eaId);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(teamKeys.ea(data.team.eaId), data);
      queryClient.setQueryData(teamKeys.detail(data.team.id), data);
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}
