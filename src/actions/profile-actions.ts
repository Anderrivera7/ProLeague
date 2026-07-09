"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserRepository } from "@/repositories/user-repository";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function nicknameSchema(nickname: string) {
  if (nickname.length < 3) return "Mínimo 3 caracteres";
  if (nickname.length > 20) return "Máximo 20 caracteres";
  if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
    return "Solo letras, números y guión bajo";
  }
  return null;
}

async function uploadAvatar(userId: string, file: File) {
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    throw new Error("Formato no válido. Usa JPG, PNG o WebP.");
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error("La imagen no puede superar 2 MB.");
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${userId}/avatar.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const admin = createAdminClient();
  const { error } = await admin.storage.from("avatars").upload(path, buffer, {
    upsert: true,
    contentType: file.type,
    cacheControl: "3600",
  });

  if (error) {
    throw new Error(
      "No se pudo subir la foto. Crea el bucket público 'avatars' en Supabase Storage."
    );
  }

  const { data } = admin.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function updateProfileAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesión expirada" };

    const nickname = String(formData.get("nickname") ?? "").trim();
    const nicknameError = nicknameSchema(nickname);
    if (nicknameError) return { error: nicknameError };

    const current = await UserRepository.findSessionById(user.id);
    if (!current) return { error: "Usuario no encontrado" };

    if (nickname.toLowerCase() !== current.nickname.toLowerCase()) {
      const taken = await UserRepository.findByNickname(nickname);
      if (taken && taken.id !== user.id) {
        return { error: "Ese gamertag ya está en uso" };
      }
    }

    let avatarUrl = current.avatarUrl;
    const avatarFile = formData.get("avatar");
    if (avatarFile instanceof File && avatarFile.size > 0) {
      avatarUrl = await uploadAvatar(user.id, avatarFile);
    }

    const updated = await UserRepository.updateProfile(user.id, {
      nickname,
      avatarUrl,
    });

    revalidatePath("/profile");
    revalidatePath("/profile/edit");
    revalidatePath("/", "layout");

    return { success: true, user: updated };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "No se pudo actualizar el perfil",
    };
  }
}
