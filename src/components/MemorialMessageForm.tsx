"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MemorialMessageForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/memorial/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorName, message }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("No se pudo enviar el mensaje. Intenta de nuevo.");
      return;
    }

    setAuthorName("");
    setMessage("");
    setSent(true);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-3 shadow-sm"
    >
      <div className="text-sm font-semibold text-foreground">
        Deja un mensaje o un recuerdo
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {sent && (
        <div className="text-sm text-emerald-700">
          Gracias por dejar tu mensaje.
        </div>
      )}
      <input
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        placeholder="Tu nombre"
        required
        className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Comparte un recuerdo, una foto en palabras, o simplemente gracias"
        required
        rows={4}
        className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent resize-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-background hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Enviando..." : "Dejar mensaje"}
      </button>
    </form>
  );
}
