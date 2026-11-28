"use client";

import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Avatar from "@/components/Avatar";
import MailLanguageSelect from "@/components/MailLanguageSelect";
import type { AppLocale } from "@/i18n/routing";
import {
  emptyRow,
  matchingFollowers,
  type Follower,
  type RecipientRow,
} from "@/lib/recipients";

const fieldClass =
  "rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent";

/** El campo Nombre: al tocarlo muestra a quienes me siguen. */
function NameInput({
  value,
  matches,
  onType,
  onPick,
}: {
  value: string;
  matches: Follower[];
  onType: (name: string) => void;
  onPick: (follower: Follower) => void;
}) {
  const t = useTranslations("capsules");
  const common = useTranslations("common");
  const listId = useId();
  const [open, setOpen] = useState(false);
  // La opción marcada con las flechas del teclado.
  const [active, setActive] = useState(-1);
  const show = open && matches.length > 0;

  return (
    <div className="relative min-w-0">
      <input
        value={value}
        onChange={(e) => {
          onType(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            if (matches.length === 0) return;
            e.preventDefault();
            setOpen(true);
            const step = e.key === "ArrowDown" ? 1 : -1;
            setActive((i) =>
              i < 0
                ? step > 0
                  ? 0
                  : matches.length - 1
                : (i + step + matches.length) % matches.length
            );
          } else if (e.key === "Enter" && show && matches[active]) {
            // Elige la persona sin guardar todavía la cápsula.
            e.preventDefault();
            onPick(matches[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        required
        role="combobox"
        aria-expanded={show}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          show && matches[active] ? `${listId}-${active}` : undefined
        }
        autoComplete="off"
        placeholder={common("name")}
        aria-label={common("name")}
        className={`${fieldClass} w-full`}
      />
      {show && (
        // Evita que el campo pierda el foco al tocar la lista.
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-lg"
        >
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted">
            {t("yourFollowers")}
          </p>
          <ul id={listId} role="listbox" aria-label={t("yourFollowers")}>
            {matches.map((f, i) => (
              <li
                key={f.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onClick={() => onPick(f)}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-black/[0.05] ${
                  i === active ? "bg-black/[0.05]" : ""
                }`}
              >
                <Avatar name={f.name} src={f.avatarUrl} size="sm" />
                <span className="truncate">{f.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** "¿Para quién es?": una o varias personas, y el idioma de su correo. */
export default function RecipientsField({
  rows,
  onChange,
  followers,
  mailLocale,
  onMailLocale,
}: {
  rows: RecipientRow[];
  onChange: (rows: RecipientRow[]) => void;
  followers: Follower[];
  mailLocale: AppLocale;
  onMailLocale: (locale: AppLocale) => void;
}) {
  const t = useTranslations("capsules");
  const common = useTranslations("common");
  const added = useRef(0);
  const newKey = () => `nueva-${++added.current}`;

  const replace = (key: string, row: RecipientRow) =>
    onChange(rows.map((r) => (r.key === key ? row : r)));
  const remove = (key: string) =>
    onChange(
      rows.length > 1
        ? rows.filter((r) => r.key !== key)
        : [emptyRow(newKey())]
    );

  const removeButton = (key: string) => (
    <button
      type="button"
      onClick={() => remove(key)}
      aria-label={t("removeRecipient")}
      className="text-muted hover:text-red-600 px-2"
    >
      ✕
    </button>
  );

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm text-muted">{t("recipients")}</legend>
      {followers.length > 0 && (
        <p className="text-xs text-muted">{t("recipientsHint")}</p>
      )}
      {rows.map((row) =>
        row.kind === "follower" ? (
          <div
            key={row.key}
            className="flex items-center gap-3 rounded-lg border border-accent/40 bg-accent/[0.06] px-3 py-2"
          >
            <Avatar name={row.name} src={row.avatarUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">
                {row.name}
              </div>
              <div className="text-xs text-muted">
                {t(row.followerId ? "followerBadge" : "accountBadge")}
              </div>
            </div>
            {removeButton(row.key)}
          </div>
        ) : (
          <div
            key={row.key}
            className="grid sm:grid-cols-2 gap-2 sm:gap-3 items-start"
          >
            <NameInput
              value={row.name}
              matches={matchingFollowers(followers, row.name, rows)}
              onType={(name) => replace(row.key, { ...row, name })}
              onPick={(f) =>
                replace(row.key, {
                  kind: "follower",
                  key: row.key,
                  name: f.name,
                  avatarUrl: f.avatarUrl,
                  followerId: f.id,
                  recipientId: null,
                })
              }
            />
            <div className="flex gap-2">
              <input
                type="email"
                value={row.email}
                onChange={(e) =>
                  replace(row.key, { ...row, email: e.target.value })
                }
                required
                placeholder={common("email")}
                aria-label={common("email")}
                className={`${fieldClass} min-w-0 flex-1`}
              />
              {rows.length > 1 && removeButton(row.key)}
            </div>
          </div>
        )
      )}
      <button
        type="button"
        onClick={() => onChange([...rows, emptyRow(newKey())])}
        className="self-start text-sm text-accent font-semibold mt-1"
      >
        {t("addRecipient")}
      </button>
      {/* Quien tiene cuenta recibe el correo en su idioma. */}
      {rows.some((r) => r.kind === "manual") && (
        <MailLanguageSelect value={mailLocale} onChange={onMailLocale} />
      )}
    </fieldset>
  );
}
