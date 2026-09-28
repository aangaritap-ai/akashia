"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CapsuleType = "TEXT" | "AUDIO" | "VIDEO";
type TriggerType = "DATE" | "DEATH";

export default function NewCapsulePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<CapsuleType>("TEXT");
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [triggerType, setTriggerType] = useState<TriggerType>("DATE");
  const [triggerDate, setTriggerDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let mediaUrl: string | null = null;

      if ((type === "AUDIO" || type === "VIDEO") && file) {
        const form = new FormData();
        form.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: form,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "No se pudo subir el archivo");
        }
        mediaUrl = uploadData.url;
      }

      const res = await fetch("/api/capsules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          textContent: type === "TEXT" ? textContent : null,
          mediaUrl,
          recipientName,
          recipientEmail,
          triggerType,
          triggerDate: triggerType === "DATE" ? triggerDate : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-xl">
      <h1 className="font-display text-2xl text-foreground">Nueva cápsula</h1>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-muted">Título del mensaje</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Para tu graduación"
            className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-muted">Tipo de mensaje</label>
          <div className="flex gap-2">
            {(["TEXT", "AUDIO", "VIDEO"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-lg px-4 py-2 text-sm border ${
                  type === t
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border text-muted"
                }`}
              >
                {t === "TEXT" ? "Texto" : t === "AUDIO" ? "Audio" : "Video"}
              </button>
            ))}
          </div>
        </div>

        {type === "TEXT" ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">Tu mensaje</label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              required
              rows={6}
              className="rounded-lg border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent resize-none"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">
              Archivo de {type === "AUDIO" ? "audio" : "video"}
            </label>
            <input
              type="file"
              accept={type === "AUDIO" ? "audio/*" : "video/*"}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
              className="text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-background"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">Nombre del destinatario</label>
            <input
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              required
              className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">Su correo</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
              className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-muted">¿Cuándo se entrega?</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTriggerType("DATE")}
              className={`rounded-lg px-4 py-2 text-sm border ${
                triggerType === "DATE"
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-border text-muted"
              }`}
            >
              En una fecha
            </button>
            <button
              type="button"
              onClick={() => setTriggerType("DEATH")}
              className={`rounded-lg px-4 py-2 text-sm border ${
                triggerType === "DEATH"
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-border text-muted"
              }`}
            >
              Cuando yo falte
            </button>
          </div>
          {triggerType === "DATE" && (
            <input
              type="date"
              value={triggerDate}
              onChange={(e) => setTriggerDate(e.target.value)}
              required
              className="mt-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          )}
          {triggerType === "DEATH" && (
            <p className="text-xs text-muted mt-1">
              Se entregará cuando tus guardianes confirmen tu fallecimiento.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-background hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Guardar cápsula"}
        </button>
      </form>
    </div>
  );
}
