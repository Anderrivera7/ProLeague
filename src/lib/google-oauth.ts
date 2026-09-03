const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

const PLACEHOLDER_ORIGIN = /TU-PROYECTO|YOUR_|example\.com|tu-dominio/i;

function isConfiguredPlaceholder(value?: string) {
  return !value || PLACEHOLDER_ORIGIN.test(value);
}

function sanitizeOrigin(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.replace(/\/$/, "");
  if (isConfiguredPlaceholder(trimmed)) return null;
  try {
    const url = trimmed.includes("://")
      ? new URL(trimmed)
      : new URL(`https://${trimmed}`);
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Origen canónico de la app.
 * En Vercel prioriza Host / x-forwarded-host del request (runtime).
 * Nunca usa placeholders tipo TU-PROYECTO.vercel.app.
 */
export function resolveAppOrigin(requestOrigin?: string): string {
  const fromRequest = sanitizeOrigin(requestOrigin);
  if (fromRequest) return fromRequest;

  const configured = sanitizeOrigin(process.env.NEXT_PUBLIC_APP_URL);
  if (configured) return configured;

  const vercel = sanitizeOrigin(process.env.VERCEL_URL);
  if (vercel) return vercel;

  return "http://localhost:3000";
}

/** Origen a partir de cabeceras del request (fiable en Vercel). */
export function resolveRequestOrigin(request: Request): string {
  const headers = request.headers;
  const forwardedHost = headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || headers.get("host");
  const proto =
    headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (process.env.VERCEL === "1" ? "https" : "http");

  if (host) {
    const fromHeaders = sanitizeOrigin(`${proto}://${host}`);
    if (fromHeaders) return fromHeaders;
  }

  try {
    return resolveAppOrigin(new URL(request.url).origin);
  } catch {
    return resolveAppOrigin();
  }
}

export function getGoogleRedirectUri(requestOrigin?: string): string {
  return `${resolveAppOrigin(requestOrigin)}/api/auth/google/callback`;
}

export function buildGoogleAuthUrl(state: string, requestOrigin?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("Falta GOOGLE_CLIENT_ID en .env");
  }

  const redirectUri = getGoogleRedirectUri(requestOrigin);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

export async function exchangeGoogleCode(
  code: string,
  redirectUri?: string
): Promise<GoogleUserInfo> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET en .env");
  }

  const uri = redirectUri ?? getGoogleRedirectUri();

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: uri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    throw new Error(tokenData.error_description ?? "Error al obtener token de Google");
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const userData = await userRes.json();

  if (!userRes.ok || !userData.email) {
    throw new Error("No se pudo obtener el email de Google");
  }

  return {
    sub: userData.sub,
    email: userData.email,
    name: userData.name,
    picture: userData.picture,
  };
}
