"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddGuardianForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/guardians", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se pudo añadir el guardián");
      return;
    }

    setName("");
    setEmail("");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border bg-white/[0.03] p-5 flex flex-col gap-3"
    >
      <div className="text-sm font-semibold text-[#faf7f0]">
        Añadir guardián
      </div>
      {error && <div className="text-sm text-red-300">{error}</div>}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          required
          className="flex-1 rounded-lg border border-border bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Correo"
          required
          className="flex-1 rounded-lg border border-border bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-[#221806] hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Enviando..." : "Invitar"}
        </button>
      </div>
    </form>
  );
}
