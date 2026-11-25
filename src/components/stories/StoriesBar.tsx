"use client";

import { useState } from "react";
import Avatar from "@/components/Avatar";
import StoryComposer from "@/components/stories/StoryComposer";
import StoryViewer from "@/components/stories/StoryViewer";
import type { StoryGroup } from "@/lib/stories";

type Me = { id: string; name: string; avatarUrl: string | null };

const cardClass =
  "group relative w-[108px] h-[176px] shrink-0 overflow-hidden rounded-2xl border border-border text-left";

// Tarjeta de un autor: su foto de portada, su avatar y su nombre.
function StoryCard({
  group,
  label,
  onOpen,
}: {
  group: StoryGroup;
  label: string;
  onOpen: () => void;
}) {
  // La portada es la primera sin ver; si ya vio todas, la más reciente.
  const cover =
    group.stories.find((s) => !s.seen) ??
    group.stories[group.stories.length - 1];

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={
        group.isMine
          ? "Ver tu historia"
          : `Ver historias de ${group.authorName}${
              group.hasUnseen ? " (sin ver)" : ""
            }`
      }
      className={`${cardClass} bg-black`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cover.imageUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
      <span
        className={`absolute top-2 left-2 rounded-full p-[3px] ${
          group.hasUnseen || group.isMine ? "bg-gold" : "bg-white/70"
        }`}
      >
        <span className="block rounded-full bg-background p-[1px]">
          <Avatar
            name={group.authorName}
            src={group.authorAvatarUrl}
            size="sm"
          />
        </span>
      </span>
      <span className="absolute bottom-2 inset-x-2 text-xs font-semibold text-white truncate">
        {label}
      </span>
    </button>
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
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        <button
          type="button"
          onClick={() => setComposing(true)}
          aria-label="Agregar una historia"
          className={`${cardClass} bg-surface flex flex-col`}
        >
          <span className="relative block h-[118px] w-full overflow-hidden bg-accent/10">
            {me.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={me.avatarUrl}
                alt=""
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <span className="flex h-full items-center justify-center font-display text-4xl text-accent">
                {me.name.trim().charAt(0).toUpperCase()}
              </span>
            )}
          </span>
          <span className="relative flex flex-1 items-end justify-center pb-2.5">
            <span className="absolute -top-4 w-8 h-8 rounded-full bg-accent text-accent-foreground ring-4 ring-surface flex items-center justify-center text-lg leading-none font-semibold">
              +
            </span>
            <span className="text-xs font-semibold text-foreground">
              Crear historia
            </span>
          </span>
        </button>

        {mine && (
          <StoryCard
            group={mine}
            label="Tu historia"
            onOpen={() => setViewing(groups.indexOf(mine))}
          />
        )}

        {others.map((g) => (
          <StoryCard
            key={g.authorId}
            group={g}
            label={g.authorName.split(" ")[0]}
            onOpen={() => setViewing(groups.indexOf(g))}
          />
        ))}

      </div>

      {others.length === 0 && (
        <p className="mt-1 text-xs text-muted leading-relaxed">
          Aquí aparecerán las historias de las personas que sigues.
        </p>
      )}

      {viewing !== null && groups[viewing] && (
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
