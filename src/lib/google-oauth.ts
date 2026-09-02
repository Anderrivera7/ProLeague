const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

const PLACEHOLDER_ORIGIN = /TU-PROYECTO|YOUR_|example\.com|tu-dominio/i;

function isConfiguredPlaceholder(value?: string) {
  return !value || PLACEHOLDER_ORIGIN.test(value);
}

/**
 * Origen canónico de la app.
 * En rutas OAuth prioriza el origin real del request (runtime) para evitar
 * valores obsoletos de NEXT_PUBLIC_APP_URL embebidos en el build.
 */
export function resolveAppOrigin(requestOrigin?: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (process.env.VERCEL === "1") {
    if (requestOrigin) {
      return requestOrigin;
    }
    if (configured && !isConfiguredPlaceholder(configured)) {
      return configured;
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
  }

  if (
    process.env.NODE_ENV === "production" &&
    configured &&
    !isConfiguredPlaceholder(configured)
  ) {
    return configured;
  }

  if (requestOrigin) {
    return requestOrigin;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return configured || "http://localhost:3000";
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
