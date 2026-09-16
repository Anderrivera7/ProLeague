import { redirect } from "next/navigation";
import { getSessionUser } from "@/actions/auth-actions";
import { Header } from "@/components/layout/header";
import { CreateCrewForm } from "@/features/crews/components/create-crew-form";

export default async function CreateCrewPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  return (
    <>
      <Header title="Crear grupo" subtitle="Arma tu círculo y rivaliza" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <CreateCrewForm />
      </div>
    </>
  );
}
