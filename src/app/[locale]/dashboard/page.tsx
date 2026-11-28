import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GRACE_PERIOD_HOURS } from "@/lib/delivery";
import CancelDeathButton from "@/components/CancelDeathButton";
import DeleteCapsuleButton from "@/components/DeleteCapsuleButton";
import { capsuleLockReason } from "@/lib/capsules";
import { LogoMark } from "@/components/Logo";
import { IconCalendar, IconMemorial } from "@/components/icons";
import {
  Callout,
  ListCard,
  PageHeader,
  StatusPill,
  primaryButtonClass,
} from "@/components/ui";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [capsules, guardianCount, me] = await Promise.all([
    prisma.capsule.findMany({
      where: { ownerId: userId },
      include: { recipients: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.guardian.count({ where: { ownerId: userId } }),
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { deceasedPendingAt: true, isDeceased: true },
    }),
  ]);
  const locked = capsuleLockReason(me) !== null;
  // Los guardianes solo hacen falta para las cápsulas "Cuando yo falte".
  const needsGuardians =
    guardianCount === 0 &&
    capsules.some(
      (c) =>
        c.triggerType === "DEATH" && c.recipients.some((r) => !r.delivered)
    );
  const t = await getTranslations("capsules");
  const common = await getTranslations("common");
  const locale = await getLocale();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Link
            href="/dashboard/capsules/new"
            className={`${primaryButtonClass} shrink-0`}
          >
            {t("new")}
          </Link>
        }
      />

      {me.deceasedPendingAt && (
        <Callout tone="danger" className="flex flex-col gap-3">
          <p>
            {t("pendingNotice", {
              date: new Date(me.deceasedPendingAt).toLocaleString(locale),
              hours: GRACE_PERIOD_HOURS,
            })}
          </p>
          <div className="self-start">
            <CancelDeathButton />
          </div>
        </Callout>
      )}

      {needsGuardians && (
        <Callout
          tone="info"
          className="flex items-center justify-between gap-4"
        >
          <span>{t("noGuardians")}</span>
          <Link
            href="/dashboard/guardians"
            className="whitespace-nowrap font-semibold text-accent hover:underline"
          >
            {t("addGuardian")}
          </Link>
        </Callout>
      )}

      {capsules.length === 0 ? (
        <div className="reveal rounded-2xl border border-border bg-surface px-6 py-14 text-center flex flex-col items-center gap-4 shadow-sm">
          <LogoMark className="w-20 h-20" variant="detail" />
          <div>
            <h2 className="font-display text-xl text-foreground">
              {t("emptyTitle")}
            </h2>
            <p className="text-sm text-muted mt-2 max-w-sm leading-relaxed">
              {t("emptyBody")}
            </p>
          </div>
          <Link href="/dashboard/capsules/new" className={primaryButtonClass}>
            {t("createFirst")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {capsules.map((c, i) => {
            const allDelivered =
              c.recipients.length > 0 &&
              c.recipients.every((r) => r.delivered);
            const someDelivered = c.recipients.some((r) => r.delivered);
            const isDeath = c.triggerType === "DEATH";
            return (
              <ListCard key={c.id} index={i}>
                <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-11 h-11 shrink-0 rounded-full bg-gold/15 text-[#7a5c2e] flex items-center justify-center"
                      aria-hidden="true"
                    >
                      {isDeath ? (
                        <IconMemorial className="w-5 h-5" />
                      ) : (
                        <IconCalendar className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {c.title}
                      </div>
                      <div className="text-sm text-muted">
                        {t("for", {
                          names: c.recipients.map((r) => r.name).join(", "),
                        })}
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        {t(`type${c.type}`)} ·{" "}
                        {isDeath
                          ? t("onDeath")
                          : t("onDate", {
                              date: new Date(
                                c.triggerDate!
                              ).toLocaleDateString(locale),
                            })}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:shrink-0 sm:flex-col sm:items-end">
                    {allDelivered ? (
                      <StatusPill tone="success">{t("delivered")}</StatusPill>
                    ) : someDelivered ? (
                      <StatusPill tone="warning">
                        {t("partlyDelivered")}
                      </StatusPill>
                    ) : (
                      <StatusPill>{t("stored")}</StatusPill>
                    )}
                    {!someDelivered && !locked && (
                      <div className="flex items-start gap-3">
                        <Link
                          href={`/dashboard/capsules/${c.id}/edit`}
                          className="text-xs text-accent font-semibold hover:underline"
                        >
                          {common("edit")}
                        </Link>
                        <DeleteCapsuleButton id={c.id} title={c.title} />
                      </div>
                    )}
                  </div>
                </div>
              </ListCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
