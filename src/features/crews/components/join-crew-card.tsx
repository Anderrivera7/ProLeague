"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { joinCrew } from "@/actions/crew-actions";
import { UserPlus } from "lucide-react";

export function JoinCrewCard() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await joinCrew(formData);
        if (result?.error) {
          setError(result.error);
          toast.error(result.error);
        }
      } catch (e) {
        if (
          e instanceof Error &&
          e.message.includes("NEXT_REDIRECT")
        ) {
          return;
        }
        toast.error("No se pudo unir al grupo");
      }
    });
  }

  return (
    <Card className="glass max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="h-4 w-4 text-primary" />
          Unirse con código
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="joinCode">Código de invitación</Label>
            <Input
              id="joinCode"
              name="joinCode"
              placeholder="ABC123"
              required
              minLength={6}
              maxLength={6}
              className="font-mono uppercase tracking-widest"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="outline" disabled={isPending}>
            {isPending ? "Uniéndose..." : "Unirse al grupo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
