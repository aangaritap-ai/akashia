import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { upcomingDates } from "@/lib/special-dates-db";
import AddSpecialDateForm from "@/components/dates/AddSpecialDateForm";
import EventsPanel from "@/components/dates/EventsPanel";
import { PageHeader } from "@/components/ui";

export default async function SpecialDatesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const events = await upcomingDates(session.user.id);

  const t = await getTranslations("datesPage");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <AddSpecialDateForm />
      <EventsPanel events={events} />
    </div>
  );
}
