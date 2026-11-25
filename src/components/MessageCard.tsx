import Link from "next/link";
import Avatar from "@/components/Avatar";
import ReactionBar from "@/components/ReactionBar";
import { IconLock, IconPaw } from "@/components/icons";
import { timeAgo } from "@/lib/format";

type Message = {
  id: string;
  authorName: string;
  message: string;
  imageUrl: string | null;
  createdAt: Date;
  isPublic: boolean;
  heartCount: number;
  condolencesCount: number;
  congratsCount: number;
  sadCount: number;
};

export default function MessageCard({
  m,
  target,
  showPrivacy = false,
  index = 0,
}: {
  m: Message;
  target?: { href: string; name: string; isPet: boolean };
  // En "Mi página" el dueño ve qué mensajes son públicos y cuáles privados.
  showPrivacy?: boolean;
  index?: number;
}) {
  return (
    <article
      className="reveal rounded-2xl border border-border bg-surface shadow-sm hover:shadow-md transition-shadow"
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      <div className="px-5 pt-5 flex items-center gap-3">
        <Avatar name={m.authorName} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm text-foreground truncate">
            {m.authorName}
          </div>
          <div className="text-xs text-muted truncate">
            {target && (
              <>
                para{" "}
                <Link href={target.href} className="text-accent hover:underline">
                  {target.isPet && (
                    <IconPaw className="inline w-3.5 h-3.5 mr-0.5 -mt-0.5" />
                  )}
                  {target.name}
                </Link>{" "}
                ·{" "}
              </>
            )}
            {timeAgo(m.createdAt)}
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
            {m.isPublic ? "Público" : "Privado"}
          </span>
        )}
        {!showPrivacy && !m.isPublic && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 text-gold px-2.5 py-1 text-[11px] font-medium">
            <IconLock className="w-3 h-3" />
            Privado
          </span>
        )}
      </div>

      <div className="px-5 pt-4 text-[15px] leading-relaxed whitespace-pre-line text-foreground">
        {m.message}
      </div>

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

      <div className="px-5 py-4 mt-4 border-t border-border">
        <ReactionBar
          messageId={m.id}
          initialCounts={{
            heartCount: m.heartCount,
            condolencesCount: m.condolencesCount,
            congratsCount: m.congratsCount,
            sadCount: m.sadCount,
          }}
        />
      </div>
    </article>
  );
}
