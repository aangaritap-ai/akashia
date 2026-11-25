import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { upcomingDates } from "@/lib/special-dates-db";
import AddSpecialDateForm from "@/components/dates/AddSpecialDateForm";
import EventsPanel from "@/components/dates/EventsPanel";
import { PageHeader } from "@/components/ui";

export default async function SpecialDatesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const events = await upcomingDates(session.user.id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Fechas especiales"
        subtitle="Solo tú las ves. El día de cada una te llega un aviso en la campana."
      />
      <AddSpecialDateForm />
      <EventsPanel events={events} />
    </div>
  );
}
