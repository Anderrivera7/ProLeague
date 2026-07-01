"use client";

import { signOut } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button
        type="submit"
        variant="ghost"
        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        Cerrar sesión
      </Button>
    </form>
  );
}
