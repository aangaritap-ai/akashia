import Link from "next/link";
import type { ReactNode } from "react";
import { colorFor } from "@/components/Avatar";
import MutualsLine from "@/components/connections/MutualsLine";
import type { Mutuals, Person } from "@/lib/connections";

// Rejilla de tarjetas de personas: 2 por fila en celular, 4 en escritorio.
export const personGridClass =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3";

// Tarjeta con la foto grande, el nombre y sus botones.
export default function PersonCard({
  person,
  mutuals,
  children,
}: {
  person: Person;
  mutuals?: Mutuals;
  children: ReactNode;
}) {
  const href = `/memorial/${person.id}`;
  const [bg, fg] = colorFor(person.name);

  return (
    <article className="reveal flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="block aspect-square"
      >
        {person.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={person.avatarUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <span
            className="flex w-full h-full items-center justify-center font-display text-6xl"
            style={{ background: bg, color: fg }}
          >
            {person.name.trim().charAt(0).toUpperCase() || "?"}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="min-w-0">
          <Link
            href={href}
            className="block truncate font-semibold text-foreground hover:underline"
          >
            {person.name}
          </Link>
          {/* Alto fijo para que los botones de la fila queden alineados. */}
          <div className="h-5 flex items-center">
            {mutuals && <MutualsLine mutuals={mutuals} />}
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-2">{children}</div>
      </div>
    </article>
  );
}
