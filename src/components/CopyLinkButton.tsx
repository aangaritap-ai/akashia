"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("myPage");

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
      {copied ? t("copied") : t("copy")}
    </button>
  );
}
