import Avatar from "@/components/Avatar";

export default function ProfileHeader({
  name,
  avatarUrl,
  eyebrow,
  subtitle,
  count,
}: {
  name: string;
  avatarUrl?: string | null;
  eyebrow?: string;
  subtitle: string;
  count: number;
}) {
  return (
    <div className="reveal rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
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
          <h1 className="font-display font-medium text-3xl text-foreground">
            {name}
          </h1>
          <p className="text-sm text-muted mt-2 max-w-lg leading-relaxed">
            {subtitle}
          </p>
          <div className="mt-4 text-xs text-muted">
            <span className="font-semibold text-foreground">{count}</span>{" "}
            {count === 1 ? "mensaje" : "mensajes"}
          </div>
        </div>
      </div>
    </div>
  );
}
