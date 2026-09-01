"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/actions/auth-actions";
import { crewCreateSchema, crewJoinSchema } from "@/schemas";
import { CrewService } from "@/services/crew-service";

export async function createCrew(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return { error: "No autenticado" };

  const parsed = crewCreateSchema.safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nombre inválido" };
  }

  const crew = await CrewService.createCrew(user.id, parsed.data.name);
  revalidatePath("/crews");
  redirect(`/crews/${crew.id}`);
}

export async function joinCrew(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return { error: "No autenticado" };

  const parsed = crewJoinSchema.safeParse({
    joinCode: formData.get("joinCode"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Código inválido" };
  }

  const result = await CrewService.joinCrew(user.id, parsed.data.joinCode);
  if (result.error) return { error: result.error };

  revalidatePath("/crews");
  redirect(`/crews/${result.crewId}`);
}

export async function leaveCrew(crewId: string) {
  const user = await getSessionUser();
  if (!user) return { error: "No autenticado" };

  const result = await CrewService.leaveCrew(user.id, crewId);
  if (result.error) return { error: result.error };

  revalidatePath("/crews");
  redirect("/crews");
}

export async function deleteCrew(crewId: string) {
  const user = await getSessionUser();
  if (!user) return { error: "No autenticado" };

  const result = await CrewService.deleteCrew(user.id, crewId);
  if (result.error) return { error: result.error };

  revalidatePath("/crews");
  redirect("/crews");
}

export async function removeCrewMember(crewId: string, memberId: string) {
  const user = await getSessionUser();
  if (!user) return { error: "No autenticado" };

  const result = await CrewService.removeMember(user.id, crewId, memberId);
  if (result.error) return { error: result.error };

  revalidatePath(`/crews/${crewId}`);
  return { success: true };
}
