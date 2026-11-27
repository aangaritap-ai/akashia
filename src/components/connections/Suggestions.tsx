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

// Personas para seguir, con un título. Se pueden quitar de la lista. Sin
// personas, la sección se oculta, salvo que haya un texto para ese caso.
export default function Suggestions({
  title,
  people,
  empty,
}: {
  title: string;
  people: (Person & { mutuals?: Mutuals })[];
  empty?: string;
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

  if (shown.length === 0 && !empty) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display font-medium text-xl text-foreground">
        {title}
      </h2>
      {shown.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface px-6 py-8 text-center text-sm text-muted">
          {empty}
        </div>
      )}
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
