import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Avatar from "@/components/Avatar";
import DeleteMessageButton from "@/components/DeleteMessageButton";
import PostActivity from "@/components/posts/PostActivity";
import { IconLock, IconPaw } from "@/components/icons";
import { timeAgo } from "@/lib/format";
import { postAnchor, type Activity } from "@/lib/posts";

type Message = {
  id: string;
  authorName: string;
  message: string;
  imageUrl: string | null;
  createdAt: Date;
  isPublic: boolean;
  byOwner: boolean;
  activity: Activity;
};

export default function MessageCard({
  m,
  author,
  target,
  showPrivacy = false,
  index = 0,
  canDelete = false,
  signedIn,
}: {
  m: Message;
  // La dueña o el dueño de la página, para sus propias publicaciones.
  author?: { id: string; name: string; avatarUrl: string | null };
  target?: { href: string; name: string; isPet: boolean };
  // En "Mi página" el dueño ve qué mensajes son públicos y cuáles privados.
  showPrivacy?: boolean;
  index?: number;
  // Solo para el dueño de la página.
  canDelete?: boolean;
  // Quien mira tiene sesión: puede reaccionar y comentar.
  signedIn: boolean;
}) {
  const t = useTranslations("messages");
  const time = useTranslations("time");
  const locale = useLocale();
  const own = m.byOwner ? author : undefined;
  const name = own?.name ?? m.authorName;

  return (
    <article
      id={postAnchor(m.id)}
      className="reveal scroll-mt-32 rounded-2xl border border-border bg-surface shadow-sm hover:shadow-md transition-shadow"
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      <div className="px-5 pt-5 flex items-center gap-3">
        <Avatar name={name} src={own?.avatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm text-foreground truncate">
            {own ? (
              <Link href={`/memorial/${own.id}`} className="hover:underline">
                {name}
              </Link>
            ) : (
              name
            )}
          </div>
          <div className="text-xs text-muted truncate">
            {target && !own && (
              <>
                {t("to")}{" "}
                <Link href={target.href} className="text-accent hover:underline">
                  {target.isPet && (
                    <IconPaw className="inline w-3.5 h-3.5 mr-0.5 -mt-0.5" />
                  )}
                  {target.name}
                </Link>{" "}
                ·{" "}
              </>
            )}
            {timeAgo(m.createdAt, locale, time("justNow"))}
          </div>
        </div>
        {showPrivacy && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
              m.isPublic
                ? "bg-accent/10 text-accent"
                : "bg-gold/15 text-gold"
            }`}
          >
            {!m.isPublic && <IconLock className="w-3 h-3" />}
            {m.isPublic ? t("public") : t("private")}
          </span>
        )}
        {!showPrivacy && !m.isPublic && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 text-gold px-2.5 py-1 text-[11px] font-medium">
            <IconLock className="w-3 h-3" />
            {t("private")}
          </span>
        )}
      </div>

      {m.message && (
        <div className="px-5 pt-4 text-[15px] leading-relaxed whitespace-pre-line [overflow-wrap:anywhere] text-foreground">
          {m.message}
        </div>
      )}

      {m.imageUrl && (
        <div className="px-5 pt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={m.imageUrl}
            alt=""
            className="w-full max-h-[28rem] object-cover rounded-xl"
          />
        </div>
      )}

      <PostActivity messageId={m.id} initial={m.activity} signedIn={signedIn}>
        {canDelete && <DeleteMessageButton id={m.id} author={name} />}
      </PostActivity>
    </article>
  );
}
