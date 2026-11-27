import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { petSubtitle } from "@/lib/pets";
import MemorialMessageForm from "@/components/MemorialMessageForm";
import MessageCard from "@/components/MessageCard";
import ProfileHeader from "@/components/ProfileHeader";

// Vista previa al compartir el enlace (WhatsApp y redes).
export async function generateMetadata({
  params,
}: PageProps<"/[locale]/huellitas/[id]">): Promise<Metadata> {
  const { id } = await params;
  const pet = await prisma.pet.findUnique({
    where: { id },
    select: { name: true, photoUrl: true, passedDate: true },
  });
  if (!pet) return {};
  const t = await getTranslations("petsPage");
  const title = t("shareTitle", { name: pet.name });
  const description = t(pet.passedDate ? "sharePassed" : "shareAlive", {
    name: pet.name,
  });
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      images: [pet.photoUrl || `/${await getLocale()}/opengraph-image`],
    },
  };
}

export default async function PetPage({
  params,
}: PageProps<"/[locale]/huellitas/[id]">) {
  const { id } = await params;
  const session = await auth();
  const viewerId = session?.user?.id ?? null;

  const pet = await prisma.pet.findUnique({
    where: { id },
    include: { owner: { select: { id: true, name: true } } },
  });
  if (!pet) notFound();

  // Los mensajes privados solo los ve la familia de la mascota.
  const isOwner = viewerId === pet.ownerId;
  const messages = await prisma.memorialMessage.findMany({
    where: { petId: pet.id, ...(isOwner ? {} : { isPublic: true }) },
    orderBy: { createdAt: "desc" },
  });

  const t = await getTranslations("petsPage");
  const common = await getTranslations("common");
  const petText = await getTranslations("pets");
  const locale = await getLocale();

  return (
    <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-10 sm:py-14">
      <div className="w-full max-w-xl flex flex-col gap-8">
        <ProfileHeader
          name={pet.name}
          avatarUrl={pet.photoUrl}
          eyebrow={t("title")}
          subtitle={petSubtitle(pet, petText, locale)}
          count={messages.length}
        />

        <div className="-mt-4 flex items-center justify-between gap-4 text-sm text-muted">
          <span>
            {t("familyOf")}{" "}
            <Link
              href={`/memorial/${pet.owner.id}`}
              className="text-accent hover:underline"
            >
              {pet.owner.name}
            </Link>
          </span>
          {isOwner && (
            <Link
              href={`/dashboard/pets/${pet.id}`}
              className="font-semibold text-accent hover:underline"
            >
              {common("edit")}
            </Link>
          )}
        </div>

        {pet.story && (
          <p className="rounded-2xl border border-border bg-surface px-5 py-4 text-[15px] leading-relaxed whitespace-pre-line [overflow-wrap:anywhere] text-foreground shadow-sm">
            {pet.story}
          </p>
        )}

        <MemorialMessageForm
          userId={pet.owner.id}
          petId={pet.id}
          canAttachPhoto={Boolean(viewerId)}
          ownerName={pet.owner.name}
          isOwner={isOwner}
        />

        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface px-6 py-10 text-center text-muted">
              {t("empty", { name: pet.name })}
            </div>
          ) : (
            messages.map((m, i) => (
              <MessageCard
                key={m.id}
                m={m}
                index={i}
                canDelete={isOwner}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
