import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  buildGoogleAuthUrl,
  getGoogleRedirectUri,
  resolveRequestOrigin,
} from "@/lib/google-oauth";

export async function GET(request: Request) {
  const origin = resolveRequestOrigin(request);

  try {
    const state = crypto.randomUUID();
    const redirectUri = getGoogleRedirectUri(origin);
    const cookieStore = await cookies();

    cookieStore.set("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    cookieStore.set("google_oauth_redirect", redirectUri, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    const authUrl = buildGoogleAuthUrl(state, origin);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al iniciar Google OAuth";
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, origin)
    );
  }
}
