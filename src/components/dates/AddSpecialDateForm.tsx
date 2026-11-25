"use client";

import { useState } from "react";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui";
import { useApiAction } from "@/components/useApiAction";
import {
  DATE_KINDS,
  KIND_LABELS,
  MAX_DATE_TITLE,
  MIN_YEAR,
  MONTH_NAMES,
  type DateKind,
} from "@/lib/special-dates";

const TITLE_HINTS: Record<DateKind, string> = {
  BIRTHDAY: "Mamá",
  ANNIVERSARY: "Nuestra boda",
  MEMORIAL: "Abuelo Luis",
  OTHER: "Grado de Sofía",
};

export default function AddSpecialDateForm() {
  const { busy, error, run } = useApiAction();
  const [kind, setKind] = useState<DateKind>("BIRTHDAY");
  const [title, setTitle] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    run(
      () =>
        fetch("/api/special-dates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind,
            title,
            day: Number(day),
            month: Number(month),
            year: year ? Number(year) : null,
          }),
        }),
      () => {
        setTitle("");
        setDay("");
        setMonth("");
        setYear("");
      }
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="reveal rounded-2xl border border-border bg-surface p-5 flex flex-col gap-4 shadow-sm"
    >
      <h2 className="font-display font-medium text-xl text-foreground">
        Agregar una fecha
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Tipo</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as DateKind)}
            className={inputClass}
          >
            {DATE_KINDS.map((k) => (
              <option key={k} value={k}>
                {KIND_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>
            {kind === "OTHER" ? "Nombre de la fecha" : "¿De quién o de qué?"}
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={MAX_DATE_TITLE}
            required
            placeholder={TITLE_HINTS[kind]}
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1.3fr)] gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Día</span>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            required
            className={inputClass}
          >
            <option value="" disabled>
              —
            </option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Mes</span>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
            className={inputClass}
          >
            <option value="" disabled>
              —
            </option>
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Año</span>
          <input
            type="number"
            inputMode="numeric"
            min={MIN_YEAR}
            max={new Date().getFullYear()}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Opcional"
            className={inputClass}
          />
        </label>
      </div>

      {error && (
        <div
          role="alert"
          className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className={`${primaryButtonClass} self-start`}
      >
        {busy ? "Guardando..." : "Agregar fecha"}
      </button>
    </form>
  );
}
