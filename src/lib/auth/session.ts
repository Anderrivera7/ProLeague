import { cache } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UserRepository } from "@/repositories/user-repository";

function isDynamicServerError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    (error as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
  );
}

/** Solo Supabase — sin consulta a Prisma (para server actions ligeras). */
export const getSessionUserId = cache(async (): Promise<string | null> => {
  try {
    await connection();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch (error) {
    if (isDynamicServerError(error)) return null;
    return null;
  }
});

/** Perfil de sesión; deduplicado por request con React.cache. */
export const getCurrentUser = cache(async () => {
  try {
    await connection();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    let profile = await UserRepository.findByIdForSession(user.id);
    if (profile) return profile;

    const baseNickname =
      user.user_metadata?.nickname ??
      user.email?.split("@")[0] ??
      `player_${user.id.slice(0, 8)}`;
    let nickname = baseNickname
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20);
    if (nickname.length < 3) nickname = `player_${user.id.slice(0, 8)}`;

    const taken = await UserRepository.findByNickname(nickname);
    if (taken && taken.id !== user.id) {
      nickname = `${nickname}_${user.id.slice(0, 4)}`.slice(0, 20);
    }

    return await UserRepository.findOrCreateFromAuth({
      id: user.id,
      email: user.email!,
      nickname,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
      country: user.user_metadata?.country ?? null,
    });
  } catch (error) {
    if (!isDynamicServerError(error)) {
      console.error("[getCurrentUser]", error);
    }
    return null;
  }
});
