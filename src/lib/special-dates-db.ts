import { prisma } from "@/lib/prisma";
import {
  dateLabel,
  daysBetween,
  isLeapYear,
  nextOccurrence,
  todayIn,
  yearsLabel,
  type DateKind,
} from "@/lib/special-dates";

export type UpcomingDate = {
  id: string;
  title: string;
  kind: DateKind;
  month: number;
  day: number;
  daysUntil: number;
  years: string | null;
};

/** Las fechas de una persona, de la más próxima a la más lejana. */
export async function upcomingDates(userId: string): Promise<UpcomingDate[]> {
  const rows = await prisma.specialDate.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
  });
  const today = todayIn();

  return rows
    .map((r) => {
      const next = nextOccurrence(r.month, r.day, today);
      return {
        id: r.id,
        title: r.title,
        kind: r.kind,
        month: r.month,
        day: r.day,
        daysUntil: daysBetween(today, next),
        years: yearsLabel(r.kind, r.year, next.year),
      };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

/**
 * Crea la notificación de las fechas que caen hoy, una sola vez por año. La
 * llama la tarea diaria.
 */
export async function createEventReminders(): Promise<number> {
  const today = todayIn();
  const days = [{ month: today.month, day: today.day }];
  // En años no bisiestos, lo del 29 de febrero se recuerda el 28.
  if (today.month === 2 && today.day === 28 && !isLeapYear(today.year)) {
    days.push({ month: 2, day: 29 });
  }
  const notYetThisYear = [
    { lastRemindedYear: null },
    { lastRemindedYear: { not: today.year } },
  ];

  const due = await prisma.specialDate.findMany({
    where: { AND: [{ OR: days }, { OR: notYetThisYear }] },
    take: 500,
  });

  let created = 0;
  for (const date of due) {
    const years = yearsLabel(date.kind, date.year, today.year);
    await prisma.$transaction(async (tx) => {
      // Se marca primero y solo avisa quien logró marcarla: así dos
      // ejecuciones seguidas no duplican el aviso.
      const claimed = await tx.specialDate.updateMany({
        where: { id: date.id, OR: notYetThisYear },
        data: { lastRemindedYear: today.year },
      });
      if (claimed.count === 0) return;
      await tx.notification.create({
        data: {
          userId: date.ownerId,
          type: "EVENT_REMINDER",
          title: "Hoy es una fecha especial",
          body: `${dateLabel(date.kind, date.title)}${
            years ? ` (${years})` : ""
          }.`,
          linkUrl: "/dashboard/dates",
        },
      });
      created++;
    });
  }
  return created;
}
