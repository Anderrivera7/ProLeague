import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UserRepository } from "@/repositories/user-repository";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const existing = await UserRepository.findById(data.user.id);
      if (!existing) {
        const nickname =
          data.user.user_metadata?.nickname ??
          data.user.user_metadata?.full_name?.replace(/\s/g, "") ??
          `player_${data.user.id.slice(0, 8)}`;

        await UserRepository.create({
          id: data.user.id,
          email: data.user.email!,
          nickname: nickname.toLowerCase().slice(0, 20),
          avatarUrl: data.user.user_metadata?.avatar_url,
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
