import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { LEGAL } from "@/lib/legal";

// Marco de las páginas de texto legal.
export default function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="flex-1 px-6 py-12">
      <article className="mx-auto w-full max-w-2xl flex flex-col gap-4 text-[15px] leading-relaxed text-foreground [&_h2]:font-display [&_h2]:font-medium [&_h2]:text-xl [&_h2]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_a]:text-accent [&_a]:underline">
        <h1 className="font-display font-medium text-4xl">{title}</h1>
        <p className="text-sm text-muted">
          Última actualización: {LEGAL.updated}
        </p>
        {children}
        <p className="mt-6 border-t border-border pt-4 text-sm text-muted">
          <Link href="/privacidad">Política de privacidad</Link> ·{" "}
          <Link href="/terminos">Términos de uso</Link> ·{" "}
          <Link href="/">Inicio</Link>
        </p>
      </article>
    </main>
  );
}
