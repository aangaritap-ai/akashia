import { useTranslations } from "next-intl";
import Avatar from "@/components/Avatar";
import { IconCalendar, IconPin } from "@/components/icons";

export default function ProfileHeader({
  name,
  avatarUrl,
  eyebrow,
  subtitle,
  count,
  coverUrl,
  motto,
  bio,
  city,
  birthday,
}: {
  name: string;
  avatarUrl?: string | null;
  eyebrow?: string;
  subtitle: string;
  count: number;
  coverUrl?: string | null;
  motto?: string | null;
  bio?: string | null;
  city?: string | null;
  birthday?: string | null;
}) {
  const t = useTranslations("profileHeader");

  return (
    <div className="reveal rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt=""
          className="h-36 sm:h-48 w-full object-cover"
        />
      ) : (
        <div className="relative h-28 sm:h-36 bg-accent">
          <div
            aria-hidden="true"
            className="absolute -top-16 right-10 w-56 h-56 rounded-full bg-gold/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, #faf6ef 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          />
        </div>
      )}
      <div className="px-5 sm:px-7 pb-6">
        <Avatar
          name={name}
          src={avatarUrl}
          size="xl"
          className="relative -mt-12 ring-4 ring-surface shadow-sm"
        />
        <div className="mt-3">
          {eyebrow && (
            <div className="text-xs font-semibold tracking-[0.14em] uppercase text-gold">
              {eyebrow}
            </div>
          )}
          <h1 className="font-display font-medium text-3xl text-foreground [overflow-wrap:anywhere]">
            {name}
          </h1>
          {motto && (
            <p className="font-display text-lg text-[#7a5c2e] mt-1 [overflow-wrap:anywhere]">
              “{motto}”
            </p>
          )}
          {bio ? (
            <p className="text-sm text-foreground mt-3 max-w-lg leading-relaxed whitespace-pre-line [overflow-wrap:anywhere]">
              {bio}
            </p>
          ) : (
            <p className="text-sm text-muted mt-2 max-w-lg leading-relaxed">
              {subtitle}
            </p>
          )}
          {(city || birthday) && (
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted">
              {city && (
                <span className="inline-flex items-center gap-1.5">
                  <IconPin className="w-4 h-4 text-gold" />
                  {city}
                </span>
              )}
              {birthday && (
                <span className="inline-flex items-center gap-1.5">
                  <IconCalendar className="w-4 h-4 text-gold" />
                  {t("birthday", { date: birthday })}
                </span>
              )}
            </div>
          )}
          <div className="mt-4 text-xs text-muted">
            <span className="font-semibold text-foreground">{count}</span>{" "}
            {t("count", { count })}
          </div>
        </div>
      </div>
    </div>
  );
}
