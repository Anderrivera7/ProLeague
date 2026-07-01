"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteTournament } from "@/actions/tournament-actions";

interface Props {
  tournamentId: string;
}

export function DeleteTournamentButton({ tournamentId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar este torneo?")) return;

    startTransition(async () => {
      const result = await deleteTournament(tournamentId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Torneo eliminado");
        router.push("/tournaments");
      }
    });
  }

  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="h-4 w-4" />
      {isPending ? "Eliminando..." : "Eliminar"}
    </Button>
  );
}
