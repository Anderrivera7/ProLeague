import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function isServerActionRequest(request: NextRequest) {
  return (
    request.method === "POST" &&
    (request.headers.has("next-action") ||
      request.headers.has("Next-Action") ||
      request.headers.get("content-type")?.includes("multipart/form-data") ===
        true)
  );
}

function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some(
      (c) =>
        c.name.includes("-auth-token") ||
        (c.name.startsWith("sb-") && c.name.includes("auth"))
    );
}

export async function updateSession(request: NextRequest) {
  if (isServerActionRequest(request)) {
    return NextResponse.next({ request });
  }

  const pathname = request.nextUrl.pathname;

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/forgot-password");

  const isPasswordResetRoute = pathname.startsWith("/reset-password");
  const isOAuthRoute = pathname.startsWith("/api/auth/");

  const isPublicRoute =
    pathname === "/" ||
    isAuthRoute ||
    isOAuthRoute ||
    isPasswordResetRoute;

  const hasSessionCookie = hasSupabaseAuthCookie(request);

  // Sin cookie: no llamar a Supabase (ahorra latencia en landing/login).
  if (!hasSessionCookie) {
    if (isPublicRoute) {
      return NextResponse.next({ request });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    return supabaseResponse;
  }

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute && !isPasswordResetRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
