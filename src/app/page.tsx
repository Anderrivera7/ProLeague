import Link from "next/link";
import { Zap, Trophy, BarChart3, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants";

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
    <div className="min-h-screen bg-background bg-grid">
      <nav className="flex items-center justify-between border-b border-border px-6 py-4 glass">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 glow-primary">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold text-gradient">{APP_NAME}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Registrarse</Link>
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6">
        <section className="py-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Zap className="h-4 w-4" />
            Plataforma eSports Profesional
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
            El mejor gestor de
            <br />
            <span className="text-gradient">torneos EA SPORTS FC</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
            Organiza competiciones, registra resultados, sigue rankings ELO y
            compite con la comunidad. Todo en una plataforma premium.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="glow-primary-strong">
              <Link href="/register">
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Ya tengo cuenta</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 pb-24 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6 glass hover:border-primary/30 transition-all"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.
      </footer>
    </div>
  );
}
