"use client";

import Link from "next/link";
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
import { requestPasswordReset } from "@/actions/auth-actions";
import { APP_NAME } from "@/constants";
import { AppLogo } from "@/components/shared/app-logo";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await requestPasswordReset(formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        setSent(true);
        toast.success("Revisa tu bandeja de entrada");
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
          <CardDescription>
            {sent
              ? "Te hemos enviado un enlace de recuperación"
              : "Recupera el acceso a tu cuenta"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Si existe una cuenta con ese email, recibirás un enlace para
                restablecer tu contraseña. Revisa también la carpeta de spam.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio de sesión
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Enviando..." : "Enviar enlace de recuperación"}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Volver al inicio de sesión
                </Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
