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
      <div className="mx-auto max-w-lg px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
        <CreateCrewForm />
      </div>
    </>
  );
}
