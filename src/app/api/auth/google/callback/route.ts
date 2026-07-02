import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeGoogleCode } from "@/lib/google-oauth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { UserRepository } from "@/repositories/user-repository";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const loginUrl = new URL("/login", origin);

  if (error) {
    loginUrl.searchParams.set("error", "Google canceló el inicio de sesión");
    return NextResponse.redirect(loginUrl);
  }

  if (!code || !state) {
    loginUrl.searchParams.set("error", "Respuesta inválida de Google");
    return NextResponse.redirect(loginUrl);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_oauth_state")?.value;
  cookieStore.delete("google_oauth_state");

  if (!savedState || savedState !== state) {
    loginUrl.searchParams.set("error", "Estado OAuth inválido");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const googleUser = await exchangeGoogleCode(code);
    const admin = createAdminClient();
    const supabase = await createClient();

    const { error: createError } = await admin.auth.admin.createUser({
      email: googleUser.email,
      email_confirm: true,
      user_metadata: {
        full_name: googleUser.name,
        avatar_url: googleUser.picture,
        provider: "google",
        google_sub: googleUser.sub,
      },
    });

    if (
      createError &&
      !createError.message.toLowerCase().includes("already") &&
      createError.status !== 422
    ) {
      throw createError;
    }

    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email: googleUser.email,
      });

    if (linkError || !linkData.properties?.hashed_token) {
      throw linkError ?? new Error("No se pudo generar sesión");
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.verifyOtp({
        type: "email",
        token_hash: linkData.properties.hashed_token,
      });

    if (sessionError || !sessionData.user) {
      throw sessionError ?? new Error("No se pudo iniciar sesión");
    }

    const existing = await UserRepository.findById(sessionData.user.id);
    if (!existing) {
      const nickname =
        googleUser.name?.replace(/\s/g, "") ??
        `player_${sessionData.user.id.slice(0, 8)}`;

      await UserRepository.create({
        id: sessionData.user.id,
        email: googleUser.email,
        nickname: nickname.toLowerCase().slice(0, 20),
        avatarUrl: googleUser.picture,
      });
    }

    return NextResponse.redirect(new URL("/dashboard", origin));
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al iniciar sesión con Google";
    loginUrl.searchParams.set("error", message);
    return NextResponse.redirect(loginUrl);
  }
}
