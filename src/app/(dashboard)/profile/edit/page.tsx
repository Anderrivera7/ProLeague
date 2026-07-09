import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/actions/auth-actions";
import { EditProfileForm } from "@/features/profile/components/edit-profile-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default async function EditProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-full flex-col pb-24">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Editar perfil</h1>
      </div>

      <div className="px-4 py-6">
        <p className="mb-6 text-sm text-muted-foreground">
          Cambia tu gamertag y foto de perfil. Los cambios se verán en torneos y rankings.
        </p>
        <EditProfileForm nickname={user.nickname} avatarUrl={user.avatarUrl} />
      </div>
    </div>
  );
}
