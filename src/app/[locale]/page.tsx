import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import InstallButton from "@/components/install/InstallButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Logo, LogoMark } from "@/components/Logo";
import {
  IconCalendar,
  IconCamera,
  IconMemorial,
  IconPaw,
  IconCheck,
  IconLock,
  IconPen,
  IconShield,
} from "@/components/icons";

// Los textos de cada bloque están en messages/<idioma>.json, sección "landing".
const steps = [
  { icon: IconPen, key: "step1" },
  { icon: IconCalendar, key: "step2" },
  { icon: IconShield, key: "step3" },
] as const;

const features = [
  { icon: IconMemorial, key: "page" },
  { icon: IconCamera, key: "stories" },
  { icon: IconPaw, key: "pets" },
  { icon: IconCalendar, key: "dates" },
] as const;

const moments = [
  "momentBirthday",
  "momentGraduation",
  "momentWedding",
  "momentAnniversary",
  "momentUniversity",
  "momentGone",
] as const;

const safeguards = [
  "safeguard1",
  "safeguard2",
  "safeguard3",
  "safeguard4",
] as const;

export default function Home() {
  const t = useTranslations("landing");
  const common = useTranslations("common");

  return (
    <main className="flex-1 flex flex-col">
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="glow-pulse pointer-events-none absolute left-1/2 top-[-140px] -translate-x-1/2 w-[720px] h-[720px] rounded-full bg-gold/20 blur-3xl"
        />
        <div className="relative flex flex-col items-center text-center gap-6 px-6 pt-20 pb-16 sm:pt-28">
          <div className="reveal" style={{ animationDelay: "0ms" }}>
            <LogoMark className="w-28 h-28" variant="detail" />
          </div>
          <div
            className="reveal text-xs font-semibold tracking-[0.16em] uppercase text-gold"
            style={{ animationDelay: "80ms" }}
          >
            {t("eyebrow")}
          </div>
          <h1
            className="reveal font-display font-medium text-5xl sm:text-7xl text-foreground leading-[1.05] max-w-3xl"
            style={{ animationDelay: "160ms" }}
          >
            {t("title")}
          </h1>
          <p
            className="reveal max-w-xl text-lg leading-relaxed text-muted"
            style={{ animationDelay: "240ms" }}
          >
            {t("intro")}
          </p>
          <div
            className="reveal flex flex-col sm:flex-row gap-3 mt-2"
            style={{ animationDelay: "320ms" }}
          >
            <Link
              href="/signup"
              className="rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-background shadow-sm hover:brightness-110 hover:shadow-md"
            >
              {t("createMine")}
            </Link>
            <Link
              href="/memorial"
              className="rounded-xl border border-border bg-surface/60 px-7 py-3.5 text-sm font-semibold hover:bg-surface hover:border-gold/60"
            >
              {t("seeFeed")}
            </Link>
            <InstallButton className="rounded-xl border border-gold/60 bg-surface/60 px-7 py-3.5 text-sm font-semibold text-accent hover:bg-surface hover:border-gold" />
          </div>

          <div
            className="reveal w-full max-w-md mt-10"
            style={{ animationDelay: "420ms" }}
          >
            <div className="float-soft rounded-2xl border border-border bg-surface p-6 text-left shadow-[0_18px_50px_-18px_rgba(27,58,92,0.35)]">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 text-gold px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider">
                  <IconLock className="w-3.5 h-3.5" />
                  {t("sealed")}
                </span>
                <span className="text-[11px] text-muted/70">{t("example")}</span>
              </div>
              <div className="font-display text-2xl text-foreground mt-4">
                {t("exampleTitle")}
              </div>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                {t("exampleBody")}
              </p>
              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <IconCalendar className="w-4 h-4 text-gold" />
                  {t("exampleDate")}
                </span>
                <span className="flex -space-x-2">
                  {["M", "J"].map((l) => (
                    <span
                      key={l}
                      className="w-6 h-6 rounded-full bg-accent/15 text-accent border-2 border-surface flex items-center justify-center text-[10px] font-semibold"
                    >
                      {l}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 border-y border-border bg-surface/50">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6 text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-foreground">
            {t("momentsTitle")}
          </h2>
          <div className="flex flex-wrap justify-center gap-2.5">
            {moments.map((m) => (
              <span
                key={m}
                className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground/80 hover:border-gold/60 hover:text-foreground"
              >
                {t(m)}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 flex justify-center">
        <div className="max-w-4xl w-full flex flex-col gap-12">
          <div className="text-center flex flex-col gap-3">
            <div className="text-xs font-semibold tracking-[0.16em] uppercase text-gold">
              {t("howEyebrow")}
            </div>
            <h2 className="font-display font-medium text-3xl sm:text-4xl text-foreground">
              {t("howTitle")}
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.key}
                  className="relative rounded-2xl border border-border bg-surface p-7 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
                >
                  <span className="absolute top-5 right-6 font-display text-4xl text-gold/25">
                    {i + 1}
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-display text-xl text-foreground">
                    {t(`${s.key}Title`)}
                  </div>
                  <div className="text-sm text-muted leading-relaxed">
                    {t(`${s.key}Body`)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 flex justify-center">
        <div className="max-w-4xl w-full flex flex-col gap-8">
          <h2 className="text-center font-display font-medium text-3xl sm:text-4xl text-foreground">
            {t("lifeTitle")}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="rounded-2xl border border-border bg-surface p-6 flex gap-4 shadow-sm"
              >
                <div className="w-11 h-11 shrink-0 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display text-xl text-foreground">
                    {t(`${key}Title`)}
                  </div>
                  <div className="text-sm text-muted leading-relaxed mt-1">
                    {t(`${key}Body`)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-accent text-accent-foreground">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-4">
            <div className="text-xs font-semibold tracking-[0.16em] uppercase text-gold">
              {t("trustEyebrow")}
            </div>
            <h2 className="font-display font-medium text-3xl sm:text-4xl leading-tight">
              {t("trustTitle")}
            </h2>
            <p className="text-accent-foreground/75 leading-relaxed">
              {t("trustBody")}
            </p>
          </div>
          <ul className="flex flex-col gap-4">
            {safeguards.map((s) => (
              <li key={s} className="flex gap-3 items-start">
                <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-gold text-accent flex items-center justify-center">
                  <IconCheck className="w-3.5 h-3.5" />
                </span>
                <span className="text-sm leading-relaxed text-accent-foreground/90">
                  {t(s)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 py-20 flex justify-center">
        <div className="max-w-xl text-center flex flex-col items-center gap-5">
          <LogoMark className="w-10 h-10" />
          <h2 className="font-display font-medium text-3xl sm:text-4xl text-foreground">
            {t("startTitle")}
          </h2>
          <p className="text-muted leading-relaxed">
            {t("startBody")}
          </p>
          <Link
            href="/signup"
            className="rounded-xl bg-accent px-8 py-3.5 text-sm font-semibold text-background shadow-sm hover:brightness-110 hover:shadow-md"
          >
            {t("createMine")}
          </Link>
        </div>
      </section>

      <footer className="px-6 py-10 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <Logo markClassName="w-6 h-6" className="text-foreground" />
          <nav className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2">
            <Link href="/memorial" className="hover:text-foreground">
              {t("footerFeed")}
            </Link>
            <Link href="/login" className="hover:text-foreground">
              {common("signIn")}
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              {common("createAccount")}
            </Link>
            <Link href="/privacidad" className="hover:text-foreground">
              {common("privacy")}
            </Link>
            <Link href="/terminos" className="hover:text-foreground">
              {common("terms")}
            </Link>
            <LanguageSwitcher />
          </nav>
          <span className="text-xs text-muted/70">
            {t("footerNote")}
          </span>
        </div>
      </footer>
    </main>
  );
}
