"use client";

import { useState } from "react";

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access can fail silently (permissions, insecure context)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background hover:brightness-110 whitespace-nowrap"
    >
      {copied ? "¡Copiado!" : "Copiar enlace"}
    </button>
  );
}
