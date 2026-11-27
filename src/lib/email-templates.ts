import { pageUrl, textsFor } from "@/lib/translator";
import type { AppLocale } from "@/i18n/routing";

// Cada función devuelve el asunto y el contenido en el idioma indicado. Todo lo
// que escribe una persona (nombres, títulos, mensajes) se escapa: nunca se
// interpreta como HTML.

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** El asunto es texto plano: sin saltos de línea. */
const line = (value: string) => value.replace(/\s+/g, " ").trim();

const wrap = (title: string, body: string) => `
<div style="background:#FAF6EF;padding:48px 24px;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid rgba(31,26,15,0.1);border-radius:16px;padding:40px;color:#221D16;">
    <div style="color:#B8935A;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:12px;">Akashia</div>
    <h1 style="font-size:24px;margin:0 0 20px;color:#221D16;">${title}</h1>
    <div style="font-size:15px;line-height:1.7;color:#4A4436;">${body}</div>
  </div>
</div>`;

const paragraph = (html: string) => `<p>${html}</p>`;
const note = (html: string) =>
  `<p style="color:#8A8172;font-size:13px;">${html}</p>`;
const button = (url: string, label: string) =>
  `<p><a href="${escapeHtml(url)}" style="display:inline-block;background:#1B3A5C;color:#FAF6EF;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;">${label}</a></p>`;
const strong = (chunks: string) => `<strong>${chunks}</strong>`;

/** Textos para el asunto (plano) y para el cuerpo (con datos escapados). */
function writer(locale: AppLocale) {
  const t = textsFor(locale, "email");
  type Key = Parameters<typeof t>[0];
  type Values = Record<string, string | number>;
  const safe = (values: Values) =>
    Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, escapeHtml(String(v))])
    );
  // Los valores cambian según el texto; la revisión de idiomas los comprueba.
  const raw = t as unknown as {
    (key: Key, values?: Values): string;
    markup(
      key: Key,
      values: Values & { strong?: (chunks: string) => string }
    ): string;
  };
  return {
    subject: (key: Key, values: Values = {}) => line(raw(key, values)),
    html: (key: Key, values: Values = {}) =>
      raw.markup(key, { ...safe(values), strong } as never),
  };
}

export function guardianInviteEmail(opts: {
  locale: AppLocale;
  guardianName: string;
  ownerName: string;
  token: string;
}) {
  const t = writer(opts.locale);
  const owner = opts.ownerName;
  return {
    subject: t.subject("inviteSubject", { owner }),
    html: wrap(
      t.html("inviteTitle"),
      paragraph(t.html("hello", { name: opts.guardianName })) +
        paragraph(t.html("inviteIntro", { owner })) +
        paragraph(t.html("inviteBody", { owner })) +
        button(
          pageUrl(`/guardian/${opts.token}`, opts.locale),
          t.html("inviteButton")
        ) +
        note(t.html("inviteNote"))
    ),
  };
}

export function passwordResetEmail(opts: {
  locale: AppLocale;
  name: string;
  token: string;
}) {
  const t = writer(opts.locale);
  return {
    subject: t.subject("resetSubject"),
    html: wrap(
      t.html("resetTitle"),
      paragraph(t.html("hello", { name: opts.name })) +
        paragraph(t.html("resetBody")) +
        button(
          pageUrl(`/reset-password/${opts.token}`, opts.locale),
          t.html("resetButton")
        ) +
        note(t.html("resetNote"))
    ),
  };
}

export function guardianConfirmedNoticeEmail(opts: {
  locale: AppLocale;
  ownerName: string;
  guardianName: string;
}) {
  const t = writer(opts.locale);
  const values = { owner: opts.ownerName, guardian: opts.guardianName };
  return {
    subject: t.subject("confirmedSubject", values),
    html: wrap(
      t.html("confirmedTitle"),
      paragraph(t.html("confirmedBody", values))
    ),
  };
}

export function deathPendingOwnerEmail(opts: {
  locale: AppLocale;
  name: string;
  graceHours: number;
  cancelToken: string;
}) {
  const t = writer(opts.locale);
  return {
    subject: t.subject("pendingOwnerSubject"),
    html: wrap(
      t.html("pendingOwnerTitle"),
      paragraph(t.html("hello", { name: opts.name })) +
        paragraph(t.html("pendingOwnerBody", { hours: opts.graceHours })) +
        paragraph(t.html("pendingOwnerWarn")) +
        button(
          pageUrl(`/cancel-death/${opts.cancelToken}`, opts.locale),
          t.html("pendingOwnerButton")
        ) +
        note(t.html("pendingOwnerNote"))
    ),
  };
}

export function deathPendingGuardianEmail(opts: {
  locale: AppLocale;
  ownerName: string;
  graceHours: number;
}) {
  const t = writer(opts.locale);
  const values = { owner: opts.ownerName, hours: opts.graceHours };
  return {
    subject: t.subject("pendingSubject", values),
    html: wrap(
      t.html("pendingTitle"),
      paragraph(t.html("pendingDone", values)) +
        paragraph(t.html("pendingBody", values))
    ),
  };
}

export function deathCancelledEmail(opts: {
  locale: AppLocale;
  ownerName: string;
}) {
  const t = writer(opts.locale);
  const values = { owner: opts.ownerName };
  return {
    subject: t.subject("cancelledSubject", values),
    html: wrap(
      t.html("cancelledTitle"),
      paragraph(t.html("cancelledBody", values))
    ),
  };
}

export function deathFinalizedGuardianEmail(opts: {
  locale: AppLocale;
  ownerName: string;
}) {
  const t = writer(opts.locale);
  const values = { owner: opts.ownerName };
  return {
    subject: t.subject("finalSubject", values),
    html: wrap(t.html("finalTitle"), paragraph(t.html("finalBody", values))),
  };
}

export function capsuleDeliveredEmail(opts: {
  locale: AppLocale;
  recipientName: string;
  senderName: string;
  title: string;
  textContent?: string | null;
  mediaUrl?: string | null;
  mediaType?: "AUDIO" | "VIDEO" | null;
}) {
  const t = writer(opts.locale);
  const sender = opts.senderName;
  const mediaBlock = opts.mediaUrl
    ? `<p><a href="${escapeHtml(opts.mediaUrl)}" style="color:#1B3A5C;font-weight:600;">${t.html(
        opts.mediaType === "VIDEO" ? "capsuleVideo" : "capsuleAudio"
      )}</a></p>`
    : "";
  const textBlock = opts.textContent
    ? `<div style="white-space:pre-line;background:#F3EEE3;border-radius:10px;padding:20px;margin-top:12px;">${escapeHtml(opts.textContent)}</div>`
    : "";
  return {
    subject: t.subject("capsuleSubject", { sender }),
    html: wrap(
      t.html("capsuleTitle", { sender }),
      paragraph(t.html("hello", { name: opts.recipientName })) +
        paragraph(t.html("capsuleIntro", { sender, title: opts.title })) +
        textBlock +
        mediaBlock
    ),
  };
}
