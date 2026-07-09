"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProfileAction } from "@/actions/profile-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInitials } from "@/lib/utils";

interface EditProfileFormProps {
  nickname: string;
  avatarUrl: string | null;
}

export function EditProfileForm({ nickname, avatarUrl }: EditProfileFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [gamertag, setGamertag] = useState(nickname);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [isPending, startTransition] = useTransition();

  function handleAvatarChange(file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Perfil actualizado");
      router.push("/profile");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group relative"
        >
          <Avatar className="h-28 w-28 border-4 border-primary/30">
            <AvatarImage src={preview ?? undefined} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {getInitials(gamertag || nickname)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          name="avatar"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleAvatarChange(e.target.files?.[0] ?? null)}
        />
        <p className="text-center text-xs text-muted-foreground">
          Toca la foto para cambiarla · JPG, PNG o WebP · máx. 2 MB
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nickname">Gamertag</Label>
        <Input
          id="nickname"
          name="nickname"
          value={gamertag}
          onChange={(e) => setGamertag(e.target.value)}
          placeholder="tu_gamertag"
          maxLength={20}
          autoComplete="off"
          required
        />
        <p className="text-xs text-muted-foreground">
          3-20 caracteres · letras, números y guión bajo
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </div>
    </form>
  );
}
