"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { updatePassword } from "@/actions/auth-actions";
import { APP_NAME } from "@/constants";
import { AppLogo } from "@/components/shared/app-logo";
import { KeyRound } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Contraseña actualizada correctamente");
        router.push("/dashboard");
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-grid p-4">
      <Card className="w-full max-w-md glass glow-primary">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center">
            <AppLogo size={88} />
          </div>
          <CardTitle className="text-2xl text-gradient">{APP_NAME}</CardTitle>
          <CardDescription>Elige una nueva contraseña</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repite la contraseña"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              <KeyRound className="mr-2 h-4 w-4" />
              {isPending ? "Guardando..." : "Guardar nueva contraseña"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            ¿Problemas con el enlace?{" "}
            <Link href="/forgot-password" className="text-primary hover:underline">
              Solicitar uno nuevo
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
