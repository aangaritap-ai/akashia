"use client";

import { useState } from "react";
import Avatar from "@/components/Avatar";
import StoryComposer from "@/components/stories/StoryComposer";
import StoryViewer from "@/components/stories/StoryViewer";
import type { StoryGroup } from "@/lib/stories";

type Me = { id: string; name: string; avatarUrl: string | null };

function Ring({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`rounded-full p-[3px] transition ${
        active ? "bg-gold" : "bg-border"
      }`}
    >
      <span className="block rounded-full bg-background p-[2px]">
        {children}
      </span>
    </span>
  );
}

export default function StoriesBar({
  groups,
  me,
}: {
  groups: StoryGroup[];
  me: Me;
}) {
  const [viewing, setViewing] = useState<number | null>(null);
  const [composing, setComposing] = useState(false);

  const mine = groups.find((g) => g.isMine);
  const others = groups.filter((g) => !g.isMine);

  return (
    <section aria-label="Historias" className="reveal">
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
        {/* Tu historia */}
        <div className="relative w-[76px] shrink-0 flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              mine ? setViewing(groups.indexOf(mine)) : setComposing(true)
            }
            aria-label={mine ? "Ver tu historia" : "Crear tu historia"}
            className="flex flex-col items-center gap-1.5"
          >
            <Ring active={false}>
              <Avatar name={me.name} src={me.avatarUrl} size="lg" />
            </Ring>
            <span className="text-xs text-foreground truncate max-w-full">
              Tu historia
            </span>
          </button>
          <button
            type="button"
            onClick={() => setComposing(true)}
            aria-label="Agregar una historia"
            className="absolute top-[40px] right-[4px] w-6 h-6 rounded-full bg-accent text-accent-foreground ring-2 ring-background flex items-center justify-center text-base leading-none font-semibold hover:brightness-110"
          >
            +
          </button>
        </div>

        {others.map((g) => (
          <button
            key={g.authorId}
            type="button"
            onClick={() => setViewing(groups.indexOf(g))}
            aria-label={`Ver historias de ${g.authorName}${
              g.hasUnseen ? " (sin ver)" : ""
            }`}
            className="w-[76px] shrink-0 flex flex-col items-center gap-1.5"
          >
            <Ring active={g.hasUnseen}>
              <Avatar name={g.authorName} src={g.authorAvatarUrl} size="lg" />
            </Ring>
            <span className="text-xs text-foreground truncate max-w-full">
              {g.authorName.split(" ")[0]}
            </span>
          </button>
        ))}

        {others.length === 0 && (
          <p className="self-center text-xs text-muted max-w-[220px] leading-relaxed">
            Aquí aparecerán las historias de las personas que sigues.
          </p>
        )}
      </div>

      {viewing !== null && (
        <StoryViewer
          groups={groups}
          startGroup={viewing}
          onClose={() => setViewing(null)}
        />
      )}
      {composing && <StoryComposer onClose={() => setComposing(false)} />}
    </section>
  );
}
