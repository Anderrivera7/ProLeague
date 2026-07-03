"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { joinTournament } from "@/actions/tournament-actions";
import { LogIn } from "lucide-react";

export default function JoinTournamentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledCode = searchParams.get("code") ?? "";
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await joinTournament(formData);
      if (result.error) {
        toast.error(result.error);
      } else if (result.tournamentId) {
        toast.success("¡Te uniste al torneo!");
        router.push(`/tournaments/${result.tournamentId}/select-team`);
      }
    });
  }

  return (
    <>
      <Header title="Unirse a torneo" subtitle="Ingresa el código de invitación" />
      <div className="flex flex-1 items-center justify-center p-4 pb-24">
        <Card className="w-full max-w-md glass">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Código del torneo</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="joinCode">Código (ej. PL-8XQ2KP)</Label>
                <Input
                  id="joinCode"
                  name="joinCode"
                  placeholder="PL-XXXXXX"
                  className="font-mono uppercase tracking-widest text-center text-lg"
                  defaultValue={prefilledCode}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Uniéndose..." : "Unirse al torneo"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              ¿Organizas uno?{" "}
              <Link href="/tournaments/create" className="text-primary hover:underline">
                Crear torneo
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
