import { useTranslations } from "next-intl";
import Avatar from "@/components/Avatar";
import type { Mutuals } from "@/lib/connections";

// "3 personas en común", con la foto de algunas. No muestra nada si no hay.
export default function MutualsLine({ mutuals }: { mutuals: Mutuals }) {
  const t = useTranslations("followers");
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
        {t("mutuals", { count: mutuals.count })}
      </span>
    </span>
  );
}
