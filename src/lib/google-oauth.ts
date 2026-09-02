const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

/**
 * Origen canónico de la app.
 * En Vercel/producción usa SIEMPRE NEXT_PUBLIC_APP_URL para que coincida con Google Cloud.
 */
export function resolveAppOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (process.env.VERCEL === "1" && configured) {
    return configured;
  }

  if (
    process.env.NODE_ENV === "production" &&
    configured &&
    configured !== "http://localhost:3000"
  ) {
    return configured;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return configured || "http://localhost:3000";
}

export function getGoogleRedirectUri(): string {
  return `${resolveAppOrigin()}/api/auth/google/callback`;
}

export function buildGoogleAuthUrl(state: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("Falta GOOGLE_CLIENT_ID en .env");
  }

  const redirectUri = getGoogleRedirectUri();

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
