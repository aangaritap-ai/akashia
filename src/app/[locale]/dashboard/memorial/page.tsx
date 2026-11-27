import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CopyLinkButton from "@/components/CopyLinkButton";
import MessageCard from "@/components/MessageCard";
import ProfileHeader from "@/components/ProfileHeader";
import { profileDetails, profileSelect } from "@/lib/profile";
import { Link } from "@/i18n/navigation";

export default async function MemorialSettingsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [me, messages] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, avatarUrl: true, ...profileSelect },
    }),
    prisma.memorialMessage.findMany({
      where: { ownerId: userId, petId: null },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const t = await getTranslations("myPage");
  const locale = await getLocale();
  const url = `${process.env.APP_URL || "http://localhost:3000"}/memorial/${userId}`;

  return (
    <div className="flex flex-col gap-6 max-w-xl w-full mx-auto">
      <ProfileHeader
        name={me.name}
        avatarUrl={me.avatarUrl}
        {...profileDetails(me, true, locale)}
        eyebrow={t("eyebrow")}
        subtitle={t("subtitle")}
        count={messages.length}
      />

      <div className="rounded-2xl border border-border bg-surface px-5 py-4 flex items-center justify-between gap-4 shadow-sm">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-gold">
            {t("shareLink")}
          </div>
          <code className="block mt-1 text-sm text-muted truncate">{url}</code>
        </div>
        <CopyLinkButton url={url} />
      </div>

      <Link
        href="/dashboard/profile"
        className="self-start text-sm font-semibold text-accent hover:underline"
      >
        {t("editProfile")}
      </Link>

      <div className="flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center text-muted">
            {t("empty")}
          </div>
        ) : (
          messages.map((m, i) => (
            <MessageCard key={m.id} m={m} showPrivacy index={i} canDelete />
          ))
        )}
      </div>
    </div>
  );
}
