import Avatar from "@/components/Avatar";
import type { Mutuals } from "@/lib/connections";

// "3 personas en común", con la foto de algunas. No muestra nada si no hay.
export default function MutualsLine({ mutuals }: { mutuals: Mutuals }) {
  if (mutuals.count === 0) return null;
  return (
    <span className="flex items-center gap-1.5 min-w-0 text-xs text-muted">
      <span aria-hidden="true" className="flex -space-x-1.5 shrink-0">
        {mutuals.sample.map((p) => (
          <Avatar
            key={p.id}
            name={p.name}
            src={p.avatarUrl}
            size="xs"
            className="ring-2 ring-surface"
          />
        ))}
      </span>
      <span className="truncate">
        {mutuals.count === 1
          ? "1 persona en común"
          : `${mutuals.count} personas en común`}
      </span>
    </span>
  );
}
