import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Avatar from "@/components/Avatar";
import MutualsLine from "@/components/connections/MutualsLine";
import RequestButtons from "@/components/connections/RequestButtons";
import type { FollowRequest } from "@/lib/connections";
import { shortAgo } from "@/lib/format";

// Columna derecha de Inicio (solo escritorio): las solicitudes más nuevas.
export default function FollowRequests({
  requests,
}: {
  requests: FollowRequest[];
}) {
  const t = useTranslations("followers");
  const common = useTranslations("common");
  const time = useTranslations("time");
  const locale = useLocale();

  return (
    <section
      aria-label={t("requests")}
      className="rounded-2xl border border-border bg-surface p-4 shadow-sm"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display font-medium text-lg text-foreground">
          {t("requests")}
        </h2>
        <Link
          href="/dashboard/connections"
          className="shrink-0 text-sm font-semibold text-accent hover:underline"
        >
          {common("seeAll")}
        </Link>
      </div>

      <ul className="mt-3 flex flex-col gap-4">
        {requests.map((r) => (
          <li key={r.connectionId} className="flex items-start gap-3">
            <Link
              href={`/memorial/${r.person.id}`}
              tabIndex={-1}
              aria-hidden="true"
            >
              <Avatar
                name={r.person.name}
                src={r.person.avatarUrl}
                size="lg"
              />
            </Link>
            <div className="min-w-0 flex-1 flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <Link
                  href={`/memorial/${r.person.id}`}
                  className="truncate text-sm font-semibold text-foreground hover:underline"
                >
                  {r.person.name}
                </Link>
                <span className="shrink-0 text-xs text-muted">
                  {shortAgo(r.createdAt, time, locale)}
                </span>
              </div>
              <MutualsLine mutuals={r.mutuals} />
              <RequestButtons
                connectionId={r.connectionId}
                personId={r.person.id}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
