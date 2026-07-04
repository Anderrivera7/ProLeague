"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserRepository } from "@/repositories/user-repository";
import { loginSchema, registerSchema } from "@/schemas";

export async function signInWithEmail(formData: FormData) {
  try {
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) return { error: error.message };
    return { success: true };
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "No se pudo conectar con el servidor. Reinicia npm run dev.",
    };
  }
}

export async function signUpWithEmail(formData: FormData) {
  try {
    const parsed = registerSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      nickname: formData.get("nickname"),
      country: formData.get("country"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
    }

    const existing = await UserRepository.findByNickname(parsed.data.nickname);
    if (existing) return { error: "El nickname ya está en uso" };

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { nickname: parsed.data.nickname },
      },
    });

    if (error) return { error: error.message };

    if (data.user) {
      await UserRepository.create({
        id: data.user.id,
        email: parsed.data.email,
        nickname: parsed.data.nickname,
        country: parsed.data.country,
      });
    }

    return { success: true };
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "No se pudo conectar con el servidor. Reinicia npm run dev.",
    };
  }
}

export async function signInWithGoogle() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return { url: `${appUrl}/api/auth/google` };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    return UserRepository.findById(user.id);
  } catch {
    return null;
  }
}
