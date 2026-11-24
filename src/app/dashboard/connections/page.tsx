import Link from "next/link";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/Avatar";
import ConnectionSearch from "@/components/ConnectionSearch";
import FollowButton from "@/components/FollowButton";
import FollowerActions from "@/components/FollowerActions";
import { ListCard, PageHeader } from "@/components/ui";
import { followFromRow } from "@/lib/connections";

type Person = { id: string; name: string; avatarUrl: string | null };

function PersonRow({
  person,
  index,
  children,
}: {
  person: Person;
  index: number;
  children: ReactNode;
}) {
  return (
    <ListCard index={index}>
      <Link
        href={`/memorial/${person.id}`}
        className="flex items-center gap-4 min-w-0 hover:underline"
      >
        <Avatar name={person.name} src={person.avatarUrl} size="lg" />
        <span className="font-semibold text-foreground truncate">
          {person.name}
        </span>
      </Link>
      <div className="shrink-0 flex flex-col items-end gap-2">{children}</div>
    </ListCard>
  );
}

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
        children
      )}
    </section>
  );
}

export default async function FollowersPage() {
  const session = await auth();
  const me = session!.user.id;

  const select = { id: true, name: true, avatarUrl: true } as const;

  // incoming: quienes me siguen o piden seguirme.
  // outgoing: a quienes sigo o pedí seguir.
  const [incoming, outgoing] = await Promise.all([
    prisma.connection.findMany({
      where: { addresseeId: me },
      include: { requester: { select } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.connection.findMany({
      where: { requesterId: me },
      include: { addressee: { select } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const requests = incoming.filter((c) => c.status === "PENDING");
  const followers = incoming.filter((c) => c.status === "ACCEPTED");
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

      <Section title="Quieren seguirte" count={requests.length}>
        {requests.map((c, i) => (
          <PersonRow key={c.id} person={c.requester} index={i}>
            <FollowerActions connectionId={c.id} kind="request" />
          </PersonRow>
        ))}
      </Section>

      <Section
        title="Te siguen"
        count={followers.length}
        empty="Todavía nadie te sigue."
      >
        {followers.map((c, i) => {
          const mine = myFollowOf(c.requesterId);
          return (
            <PersonRow key={c.id} person={c.requester} index={i}>
              <FollowButton
                key={`${mine.state}-${mine.connectionId}`}
                userId={c.requesterId}
                initialState={mine.state}
                initialConnectionId={mine.connectionId}
              />
              <FollowerActions connectionId={c.id} kind="follower" />
            </PersonRow>
          );
        })}
      </Section>

      <Section
        title="Siguiendo"
        count={following.length}
        empty="Todavía no sigues a nadie. Busca a alguien por su nombre para empezar."
      >
        {following.map((c, i) => (
          <PersonRow key={c.id} person={c.addressee} index={i}>
            <FollowButton
              userId={c.addresseeId}
              initialState="following"
              initialConnectionId={c.id}
            />
          </PersonRow>
        ))}
      </Section>

      <Section title="Solicitudes enviadas" count={sent.length}>
        {sent.map((c, i) => (
          <PersonRow key={c.id} person={c.addressee} index={i}>
            <FollowButton
              userId={c.addresseeId}
              initialState="sent"
              initialConnectionId={c.id}
            />
          </PersonRow>
        ))}
      </Section>
    </div>
  );
}
