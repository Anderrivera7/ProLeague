import Link from "next/link";
import { Trophy, BarChart3, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants";
import { AppLogo } from "@/components/shared/app-logo";

const features = [
  {
    icon: Trophy,
    title: "Gestión de Torneos",
    description:
      "Liga, eliminación directa, grupos e ida y vuelta con generación automática de fixtures.",
  },
  {
    icon: BarChart3,
    title: "Sistema ELO",
    description:
      "Ranking global dinámico con historial completo y comparativas Head to Head.",
  },
  {
    icon: Users,
    title: "Perfiles de Jugador",
    description:
      "Estadísticas detalladas, logros, trofeos y gráficos de rendimiento.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background bg-grid">
      <nav className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4 glass">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <AppLogo size={36} className="shrink-0" priority />
          <span className="truncate text-base font-bold text-gradient sm:text-lg">
            {APP_NAME}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Button variant="ghost" size="sm" className="px-2 sm:px-4" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button size="sm" className="px-3 sm:px-4" asChild>
            <Link href="/register">Registro</Link>
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="py-14 text-center sm:py-20 md:py-24">
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs text-primary sm:mb-6 sm:px-4 sm:text-sm">
            <AppLogo size={18} />
            <span className="truncate">Plataforma eSports Profesional</span>
          </div>
          <h1 className="mb-4 text-[2rem] font-bold leading-tight tracking-tight sm:mb-6 sm:text-5xl md:text-7xl">
            El mejor gestor de
            <br />
            <span className="text-gradient">torneos EA SPORTS FC</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground sm:mb-10 sm:text-lg">
            Organiza competiciones, registra resultados, sigue rankings ELO y
            compite con la comunidad. Todo en una plataforma premium.
          </p>
          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            <Button size="lg" asChild className="glow-primary-strong w-full sm:w-auto">
              <Link href="/register">
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/login">Ya tengo cuenta</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 pb-16 sm:gap-6 sm:pb-24 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30 sm:p-6 glass"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 sm:h-12 sm:w-12">
                <feature.icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>
              <h3 className="mb-2 text-base font-semibold sm:text-lg">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground sm:py-8 sm:text-sm">
        © {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.
      </footer>
    </div>
  );
}
