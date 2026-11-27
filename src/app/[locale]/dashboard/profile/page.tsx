import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { splitName } from "@/lib/contact";
import { profileSelect } from "@/lib/profile";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ProfileForm from "@/components/ProfileForm";
import DeleteAccountSection from "@/components/DeleteAccountSection";
import { PageHeader } from "@/components/ui";

export default async function ProfilePage({
  searchParams,
}: PageProps<"/[locale]/dashboard/profile">) {
  const { eliminar } = await searchParams;
  const t = await getTranslations("profile");
  const language = await getTranslations("language");
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      lastName: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
      ...profileSelect,
    },
  });

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Link
            href={`/memorial/${user.id}`}
            className="shrink-0 text-sm font-semibold text-accent hover:underline"
          >
            {t("seeMyPage")}
          </Link>
        }
      />
      <ProfileForm
        initial={{
          ...splitName(user.name, user.lastName),
          phone: user.phone ?? "",
          avatarUrl: user.avatarUrl,
          coverUrl: user.coverUrl,
          bio: user.bio ?? "",
          motto: user.motto ?? "",
          city: user.city ?? "",
          showCity: user.showCity,
          birthMonth: user.birthMonth?.toString() ?? "",
          birthDay: user.birthDay?.toString() ?? "",
          shareBirthday: user.shareBirthday,
        }}
        email={user.email}
        memberSince={user.createdAt.toISOString()}
      />
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4">
        <div>
          <div className="text-sm font-semibold text-foreground">
            {language("label")}
          </div>
          <p className="text-xs text-muted">{language("hint")}</p>
        </div>
        <LanguageSwitcher remember />
      </div>
      <DeleteAccountSection
        error={typeof eliminar === "string" ? eliminar : undefined}
      />
    </div>
  );
}
