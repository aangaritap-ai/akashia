import Link from "next/link";
import DeleteDateButton from "@/components/dates/DeleteDateButton";
import { IconCalendar } from "@/components/icons";
import { ListCard, StatusPill } from "@/components/ui";
import { MONTH_NAMES, dateLabel, whenLabel } from "@/lib/special-dates";
import type { UpcomingDate } from "@/lib/special-dates-db";

export default function EventsPanel({ events }: { events: UpcomingDate[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-10 flex flex-col items-center gap-3 text-center">
        <IconCalendar className="w-8 h-8 text-gold" />
        <p className="text-sm text-muted max-w-xs leading-relaxed">
          Agrega cumpleaños, aniversarios o fechas de recuerdo y te avisaremos
          ese día.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {events.map((event, i) => {
        const label = dateLabel(event.kind, event.title);
        return (
          <li key={event.id}>
            <ListCard index={i}>
              <div className="flex items-center gap-4 min-w-0">
                <div
                  aria-hidden="true"
                  className={`w-12 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center leading-none ${
                    event.daysUntil === 0
                      ? "bg-gold text-white"
                      : "bg-accent/10 text-accent"
                  }`}
                >
                  <span className="font-display font-semibold text-lg">
                    {event.day}
                  </span>
                  <span className="text-[10px] uppercase mt-0.5">
                    {MONTH_NAMES[event.month - 1].slice(0, 3)}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground [overflow-wrap:anywhere]">
                    {label}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {event.day} de {MONTH_NAMES[event.month - 1]}
                    {event.years ? ` · ${event.years}` : ""}
                  </div>
                  <div className="mt-1.5">
                    <StatusPill
                      tone={
                        event.daysUntil === 0
                          ? "gold"
                          : event.daysUntil <= 7
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {whenLabel(event.daysUntil)}
                    </StatusPill>
                  </div>
                </div>
              </div>
              {event.petId ? (
                <Link
                  href={`/dashboard/pets/${event.petId}`}
                  className="text-xs text-muted hover:underline shrink-0"
                >
                  Ver mascota
                </Link>
              ) : (
                <DeleteDateButton id={event.id} label={label} />
              )}
            </ListCard>
          </li>
        );
      })}
    </ul>
  );
}
