import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ConnectionSearch from "@/components/ConnectionSearch";
import FollowButton from "@/components/FollowButton";
import PersonCard, { personGridClass } from "@/components/connections/PersonCard";
import RemoveFollowerButton from "@/components/connections/RemoveFollowerButton";
import RequestButtons from "@/components/connections/RequestButtons";
import Suggestions from "@/components/connections/Suggestions";
import { PageHeader } from "@/components/ui";
import { followFromRow, followRequests, suggestions } from "@/lib/connections";

function Section({
  title,
  count,
  empty,
  children,
}: {
  title: string;
  count: number;
  empty?: string;
  children: ReactNode;
}) {
  if (count === 0 && !empty) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display font-medium text-xl text-foreground">
        {title}
        {count > 0 && (
          <span className="ml-2 text-sm text-muted font-sans">{count}</span>
        )}
      </h2>
      {count === 0 ? (
        <div className="rounded-2xl border border-border bg-surface px-6 py-8 text-center text-sm text-muted">
          {empty}
        </div>
      ) : (
        <div className={personGridClass}>{children}</div>
      )}
    </section>
  );
}

export default async function FollowersPage() {
  const session = await auth();
  const me = session!.user.id;

  const select = { id: true, name: true, avatarUrl: true } as const;

  // incoming: quienes me siguen. outgoing: a quienes sigo o pedí seguir.
  const [requests, incoming, outgoing, suggested] = await Promise.all([
    followRequests(me),
    prisma.connection.findMany({
      where: { addresseeId: me, status: "ACCEPTED" },
      include: { requester: { select } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.connection.findMany({
      where: { requesterId: me },
      include: { addressee: { select } },
      orderBy: { createdAt: "desc" },
    }),
    suggestions(me),
  ]);

  const following = outgoing.filter((c) => c.status === "ACCEPTED");
  const sent = outgoing.filter((c) => c.status === "PENDING");

  const myFollowOf = (userId: string) =>
    followFromRow(outgoing.find((c) => c.addresseeId === userId) ?? null);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Seguidores"
        subtitle="Quien tú apruebes podrá ver tus historias de 24 horas. Tú ves las historias de las personas que sigues."
      />

      <ConnectionSearch />

      <Section title="Solicitudes de seguimiento" count={requests.length}>
        {requests.map((r) => (
          <PersonCard key={r.connectionId} person={r.person} mutuals={r.mutuals}>
            <RequestButtons
              connectionId={r.connectionId}
              personId={r.person.id}
              layout="stack"
            />
          </PersonCard>
        ))}
      </Section>

      <Suggestions people={suggested} />

      <Section
        title="Te siguen"
        count={incoming.length}
        empty="Todavía nadie te sigue."
      >
        {incoming.map((c) => {
          const mine = myFollowOf(c.requesterId);
          return (
            <PersonCard key={c.id} person={c.requester}>
              <FollowButton
                key={`${mine.state}-${mine.connectionId}`}
                variant="card"
                userId={c.requesterId}
                initialState={mine.state}
                initialConnectionId={mine.connectionId}
              />
              <RemoveFollowerButton
                connectionId={c.id}
                personId={c.requesterId}
              />
            </PersonCard>
          );
        })}
      </Section>

      <Section
        title="Siguiendo"
        count={following.length}
        empty="Todavía no sigues a nadie. Busca a alguien por su nombre para empezar."
      >
        {following.map((c) => (
          <PersonCard key={c.id} person={c.addressee}>
            <FollowButton
              variant="card"
              userId={c.addresseeId}
              initialState="following"
              initialConnectionId={c.id}
            />
          </PersonCard>
        ))}
      </Section>

      <Section title="Solicitudes enviadas" count={sent.length}>
        {sent.map((c) => (
          <PersonCard key={c.id} person={c.addressee}>
            <FollowButton
              variant="card"
              userId={c.addresseeId}
              initialState="sent"
              initialConnectionId={c.id}
            />
          </PersonCard>
        ))}
      </Section>
    </div>
  );
}
