"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCrew } from "@/actions/crew-actions";
import { Sparkles, Users } from "lucide-react";

export function CreateCrewForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createCrew(formData);
      } catch (e) {
        if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) {
          return;
        }
        toast.error("No se pudo crear el grupo");
      }
    });
  }

  return (
    <div className="mx-auto max-w-lg overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-[#161616] via-[#111] to-[#0b0b0b]">
      <div className="border-b border-border/60 bg-gradient-to-r from-primary/15 via-transparent to-transparent px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary/85">
              Nuevo grupo
            </p>
            <h2 className="text-base font-semibold sm:text-lg">
              Crea tu círculo de amigos
            </h2>
          </div>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-5 p-5 sm:p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del grupo</Label>
          <Input
            id="name"
            name="name"
            placeholder="Ej: Los del barrio, FC Amigos..."
            required
            minLength={2}
            maxLength={40}
            className="h-12 rounded-2xl"
          />
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
            Obtendrás un código para invitar y comparar podios al instante.
          </p>
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full rounded-full"
        >
          {isPending ? "Creando..." : "Crear grupo"}
        </Button>
      </form>
    </div>
  );
}
