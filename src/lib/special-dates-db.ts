import { prisma } from "@/lib/prisma";
import { getFollowingIds } from "@/lib/connections";
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
  petId: string | null;
  /** Cumpleaños de alguien a quien sigo (no es una fecha propia). */
  personId: string | null;
};

/** Mis fechas y los cumpleaños que comparten quienes sigo, por cercanía. */
export async function upcomingDates(userId: string): Promise<UpcomingDate[]> {
  const rows = await prisma.specialDate.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
  });
  const people = await prisma.user.findMany({
    where: {
      id: { in: await getFollowingIds(userId) },
      shareBirthday: true,
      isDeceased: false,
      birthMonth: { not: null },
      birthDay: { not: null },
    },
    select: { id: true, name: true, birthMonth: true, birthDay: true },
  });
  const today = todayIn();
  const until = (month: number, day: number) =>
    daysBetween(today, nextOccurrence(month, day, today));

  const mine: UpcomingDate[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    kind: r.kind,
    month: r.month,
    day: r.day,
    daysUntil: until(r.month, r.day),
    years: yearsLabel(
      r.kind,
      r.year,
      nextOccurrence(r.month, r.day, today).year
    ),
    petId: r.petId,
    personId: null,
  }));
  const birthdays: UpcomingDate[] = people.map((p) => ({
    id: `persona-${p.id}`,
    title: p.name,
    kind: "BIRTHDAY",
    month: p.birthMonth!,
    day: p.birthDay!,
    daysUntil: until(p.birthMonth!, p.birthDay!),
    years: null,
    petId: null,
    personId: p.id,
  }));

  return [...mine, ...birthdays].sort((a, b) => a.daysUntil - b.daysUntil);
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
  return created + (await remindBirthdays(days, today.year));
}

// Avisa a los seguidores de quien cumple años hoy y decidió compartirlo.
async function remindBirthdays(
  days: { month: number; day: number }[],
  year: number
): Promise<number> {
  const notYetThisYear = [
    { birthdayRemindedYear: null },
    { birthdayRemindedYear: { not: year } },
  ];
  const people = await prisma.user.findMany({
    where: {
      shareBirthday: true,
      isDeceased: false,
      AND: [
        { OR: days.map((d) => ({ birthMonth: d.month, birthDay: d.day })) },
        { OR: notYetThisYear },
      ],
    },
    select: { id: true, name: true },
    take: 500,
  });

  let created = 0;
  for (const person of people) {
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.user.updateMany({
        where: { id: person.id, OR: notYetThisYear },
        data: { birthdayRemindedYear: year },
      });
      if (claimed.count === 0) return;
      const followers = await tx.connection.findMany({
        where: { addresseeId: person.id, status: "ACCEPTED" },
        select: { requesterId: true },
      });
      if (followers.length === 0) return;
      const sent = await tx.notification.createMany({
        data: followers.map((f) => ({
          userId: f.requesterId,
          actorId: person.id,
          type: "EVENT_REMINDER" as const,
          title: "Cumpleaños hoy",
          body: `Hoy es el cumpleaños de ${person.name}.`,
          linkUrl: `/memorial/${person.id}`,
        })),
      });
      created += sent.count;
    });
  }
  return created;
}
