import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toDateInput } from "@/lib/pets";
import CopyLinkButton from "@/components/CopyLinkButton";
import DeletePetButton from "@/components/pets/DeletePetButton";
import PetForm from "@/components/pets/PetForm";
import { PageHeader } from "@/components/ui";

export default async function EditPetPage({
  params,
}: PageProps<"/dashboard/pets/[id]">) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const pet = await prisma.pet.findFirst({
    where: { id, ownerId: session.user.id },
  });
  if (!pet) notFound();

  const url = `${process.env.APP_URL || "http://localhost:3000"}/huellitas/${pet.id}`;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={pet.name} subtitle="Edita sus datos y su historia." />

      <div className="rounded-2xl border border-border bg-surface px-5 py-4 flex items-center justify-between gap-4 shadow-sm">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-gold">
            Enlace para compartir
          </div>
          <code className="block mt-1 text-sm text-muted truncate">{url}</code>
        </div>
        <CopyLinkButton url={url} />
      </div>

      <PetForm
        petId={pet.id}
        initial={{
          name: pet.name,
          species: pet.species,
          story: pet.story ?? "",
          photoUrl: pet.photoUrl,
          birthDate: toDateInput(pet.birthDate),
          adoptionDate: toDateInput(pet.adoptionDate),
          passedDate: toDateInput(pet.passedDate),
        }}
      />

      <DeletePetButton id={pet.id} name={pet.name} />
    </div>
  );
}
