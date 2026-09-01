"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createCrew } from "@/actions/crew-actions";
import { Users } from "lucide-react";

export function CreateCrewForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createCrew(formData);
      } catch (e) {
        if (
          e instanceof Error &&
          e.message.includes("NEXT_REDIRECT")
        ) {
          return;
        }
        toast.error("No se pudo crear el grupo");
      }
    });
  }

  return (
    <Card className="glass max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          Nuevo grupo de compañeros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del grupo</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ej: Los del barrio, FC Amigos..."
              required
              minLength={2}
              maxLength={40}
            />
            <p className="text-xs text-muted-foreground">
              Comparte el código con tus amigos para que se unan y comparen
              quién tiene más títulos.
            </p>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creando..." : "Crear grupo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
