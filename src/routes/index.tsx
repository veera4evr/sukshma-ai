import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Grid3x3, ShieldCheck, Sprout } from "lucide-react";
import { Logo } from "@/components/app/Logo";
import { MeshMap, Legend } from "@/components/app/MeshMap";
import { Flow, DemoTag } from "@/components/app/widgets";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SUKSHMA-AI — Hyperlocal Weather for Every Panchayat" },
      { name: "description", content: "AI weather downscaling that turns coarse block forecasts into reliability-aware Panchayat-level farm advisories." },
      { property: "og:title", content: "SUKSHMA-AI — Hyperlocal Weather for Every Panchayat" },
      { property: "og:description", content: "Coarse forecasts refined into trusted, Panchayat-level agricultural decisions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

import { useAuth } from "@/lib/auth";

const features = [
  { icon: Grid3x3, t: "Fine-Scale Weather", d: "Localized weather estimates from coarse forecasts." },
  { icon: ShieldCheck, t: "Reliability-Aware", d: "Shows confidence and uncertainty." },
  { icon: Sprout, t: "Actionable Advisory", d: "Converts weather information into agricultural guidance." },
];

function Landing() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Logo />
        <Button asChild variant="outline">
          <Link to={user ? "/dashboard" : "/login"}>
            {user ? "Open dashboard" : "Sign in"}
          </Link>
        </Button>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-12 md:px-8 lg:grid-cols-2 lg:pt-24">
        {/* Decorative background glow for hero */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            <Sprout className="size-4" />
            <span>Agro-met decision support platform</span>
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
            Hyperlocal Weather for <span className="text-primary">Every Panchayat</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-slate-600 md:text-xl">
            Transform coarse block-level forecasts into localized, reliability-aware agricultural intelligence down to the 1 km village level.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="h-14 rounded-full px-8 text-base shadow-sm">
              <Link to={user ? "/dashboard" : "/login"}>
                {user ? "Open Dashboard" : "Get Started"} <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-14 rounded-full px-8 text-base font-semibold">
              <a href="#how">How it works</a>
            </Button>
          </div>
          <p className="mt-8 text-sm text-slate-500 flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-500" />
            Complements official IMD forecasts — a refinement layer.
          </p>
        </div>

        <div className="card-surface p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="eyebrow mb-2">Block forecast</p>
              <MeshMap layer="rain" mode="coarse" showBoundaries={false} />
            </div>
            <div>
              <p className="eyebrow mb-2 text-primary">SUKSHMA Mesh · 1 km grid</p>
              <MeshMap layer="rain" showLabels={false} />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <Legend layer="rain" compact />
            <DemoTag label="Illustrative · not ground truth" />
          </div>
        </div>
      </section>

      <section id="how" className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <p className="eyebrow mb-3">How it works</p>
          <h2 className="mb-8 max-w-2xl text-3xl font-semibold">From coarse forecasts to trusted Panchayat-level decisions.</h2>
          <Flow steps={["Block Forecast", "SUKSHMA Mesh", "Local Calibration", "Reliability", "Panchayat Advisory", "SMS Alert"]} highlight="SUKSHMA Mesh" />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, t, d }) => (
              <div key={t} className="card-surface p-6">
                <span className="mb-4 grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="size-5" /></span>
                <h3 className="text-lg font-semibold">{t}</h3>
                <p className="mt-1 text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground md:px-8">
        <span>© 2026 SUKSHMA-AI · Prototype running on demo data</span>
        <Link to="/dashboard" className="font-semibold text-primary">Go to dashboard →</Link>
      </footer>
    </div>
  );
}
