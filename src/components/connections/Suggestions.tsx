"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import FollowButton from "@/components/FollowButton";
import PersonCard, { personGridClass } from "@/components/connections/PersonCard";
import { blockSecondaryClass } from "@/components/ui";
import type { Mutuals, Person } from "@/lib/connections";
import { hiddenSuggestions, hideSuggestion } from "@/lib/hidden-suggestions";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

// Personas para seguir, con un título. Se pueden quitar de la lista.
export default function Suggestions({
  title,
  people,
}: {
  title: string;
  people: (Person & { mutuals?: Mutuals })[];
}) {
  const saved = useSyncExternalStore(subscribe, hiddenSuggestions, () => "");
  // Respaldo por si el navegador no deja guardar.
  const [dismissed, setDismissed] = useState<string[]>([]);
  const common = useTranslations("common");
  const hidden = new Set([...saved.split(","), ...dismissed]);
  const shown = people.filter((p) => !hidden.has(p.id));

  function dismiss(id: string) {
    hideSuggestion(id);
    setDismissed((prev) => [...prev, id]);
  }

  if (shown.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display font-medium text-xl text-foreground">
        {title}
      </h2>
      <div className={personGridClass}>
        {shown.map((person) => (
          <PersonCard key={person.id} person={person} mutuals={person.mutuals}>
            <FollowButton
              variant="card"
              userId={person.id}
              initialState="none"
              initialConnectionId={null}
            />
            <button
              type="button"
              onClick={() => dismiss(person.id)}
              className={blockSecondaryClass}
            >
              {common("remove")}
            </button>
          </PersonCard>
        ))}
      </div>
    </section>
  );
}
