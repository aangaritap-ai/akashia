import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { petSubtitle } from "@/lib/pets";
import Avatar from "@/components/Avatar";
import PetForm from "@/components/pets/PetForm";
import { ListCard, PageHeader } from "@/components/ui";

export default async function PetsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const pets = await prisma.pet.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  const t = await getTranslations("petsPage");
  const common = await getTranslations("common");
  const petText = await getTranslations("pets");
  const locale = await getLocale();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
      />

      {pets.length > 0 && (
        <ul className="flex flex-col gap-3">
          {pets.map((pet, i) => (
            <li key={pet.id}>
              <ListCard index={i}>
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar name={pet.name} src={pet.photoUrl} size="lg" />
                  <div className="min-w-0">
                    <div className="font-display font-medium text-lg text-foreground truncate">
                      {pet.name}
                    </div>
                    <div className="text-xs text-muted">
                      {petSubtitle(pet, petText, locale)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0 text-sm">
                  <Link
                    href={`/huellitas/${pet.id}`}
                    className="font-semibold text-accent hover:underline"
                  >
                    {t("viewPage")}
                  </Link>
                  <Link
                    href={`/dashboard/pets/${pet.id}`}
                    className="text-muted hover:underline"
                  >
                    {common("edit")}
                  </Link>
                </div>
              </ListCard>
            </li>
          ))}
        </ul>
      )}

      <PetForm />
    </div>
  );
}
