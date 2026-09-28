import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <section className="flex flex-col items-center text-center gap-7 px-6 pt-24 pb-20">
        <div className="text-xs font-semibold tracking-[0.14em] uppercase text-accent">
          Un registro para siempre
        </div>
        <h1 className="font-display font-medium text-6xl sm:text-7xl text-[#faf7f0]">
          Akashia
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-muted">
          Deja mensajes para las personas que amas — entregados en el momento
          exacto en que más los necesiten, incluso cuando ya no estés.
        </p>
        <div className="flex gap-3 mt-2">
          <Link
            href="/signup"
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-[#221806] hover:brightness-110"
          >
            Crear mi cuenta
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-border px-6 py-3 text-sm font-semibold hover:bg-white/5"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      <section className="px-6 py-16 flex justify-center border-t border-border bg-white/[0.02]">
        <div className="max-w-3xl flex flex-col gap-12">
          <h2 className="text-center font-display font-medium text-3xl text-[#faf7f0]">
            Cómo funciona
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                n: "1",
                title: "Escribe tu mensaje",
                body: "Texto, voz o video, a tu ritmo.",
              },
              {
                n: "2",
                title: "Elige el momento",
                body: 'Una fecha, o "cuando yo falte".',
              },
              {
                n: "3",
                title: "Tus guardianes lo cuidan",
                body: "Personas de confianza confirman cuándo se entrega.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-border bg-white/[0.03] p-6 flex flex-col gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-accent/15 text-accent flex items-center justify-center font-display">
                  {s.n}
                </div>
                <div className="font-semibold text-[#faf7f0]">{s.title}</div>
                <div className="text-sm text-muted leading-relaxed">
                  {s.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 flex justify-center">
        <div className="max-w-xl text-center flex flex-col gap-4">
          <h2 className="font-display font-medium text-2xl text-[#faf7f0]">
            Tu privacidad, primero
          </h2>
          <p className="text-muted leading-relaxed">
            Cada mensaje se guarda de forma privada. Tu historia es tuya —
            nosotros solo la guardamos hasta que sea el momento.
          </p>
        </div>
      </section>

      <footer className="px-6 py-8 flex justify-center border-t border-border text-xs text-muted/70">
        Akashia · 2026 · hecho con cariño para quienes amamos
      </footer>
    </main>
  );
}
