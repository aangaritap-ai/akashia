import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  dateLabel,
  monthName,
  whenLabel,
  yearsLabel,
} from "@/lib/special-dates";
import type { UpcomingDate } from "@/lib/special-dates-db";

const DAYS_AHEAD = 60;
const MAX_SHOWN = 5;

// Columna derecha de Inicio: las fechas especiales más cercanas.
export default function UpcomingEvents({ events }: { events: UpcomingDate[] }) {
  const soon = events.filter((e) => e.daysUntil <= DAYS_AHEAD);
  const shown = soon.slice(0, MAX_SHOWN);
  const t = useTranslations("home");
  const dates = useTranslations("dates");
  const locale = useLocale();

  return (
    <section
      aria-label={t("upcoming")}
      className="rounded-2xl border border-border bg-surface p-4 shadow-sm"
    >
      <h2 className="font-display font-medium text-lg text-foreground">
        {t("upcoming")}
      </h2>

      {shown.length === 0 ? (
        <p className="mt-2 text-sm text-muted leading-relaxed">
          {events.length === 0
            ? t("addDatesHint")
            : t("noDatesSoon", { days: DAYS_AHEAD })}
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {shown.map((event) => (
            <li key={event.id} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`w-11 h-11 shrink-0 rounded-xl flex flex-col items-center justify-center leading-none ${
                  event.daysUntil === 0
                    ? "bg-gold text-white"
                    : "bg-accent/10 text-accent"
                }`}
              >
                <span className="font-display font-semibold text-base">
                  {event.day}
                </span>
                <span className="text-[9px] uppercase mt-0.5">
                  {monthName(event.month, locale).slice(0, 3)}
                </span>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground [overflow-wrap:anywhere]">
                  {dateLabel(event.kind, event.title, dates)}
                </span>
                <span
                  className={`block text-xs ${
                    event.daysUntil === 0
                      ? "font-semibold text-[#7a5c2e]"
                      : "text-muted"
                  }`}
                >
                  {whenLabel(event.daysUntil, dates)}
                  {event.years
                    ? ` · ${yearsLabel(event.kind, event.years, dates)}`
                    : ""}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/dashboard/dates"
        className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
      >
        {events.length === 0
          ? t("addDate")
          : soon.length > MAX_SHOWN
            ? t("seeAllDates", { count: events.length })
            : t("seeAndAdd")}
      </Link>
    </section>
  );
}
