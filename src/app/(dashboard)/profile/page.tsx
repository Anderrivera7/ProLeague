import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth-actions";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import {
  Users,
  BarChart3,
  UserPlus,
  Settings,
  ChevronRight,
  Trophy,
  Swords,
  Medal,
} from "lucide-react";

const menuItems = [
  { href: "/players", label: "Mis equipos", icon: Users },
  { href: "/stats", label: "Estadísticas", icon: BarChart3 },
  { href: "/players", label: "Invitar amigos", icon: UserPlus },
  { href: "/dashboard", label: "Configuración", icon: Settings },
];

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const stats = [
    {
      label: "Torneos",
      value: user.stats?.seasonsPlayed ?? 0,
      icon: Trophy,
    },
    {
      label: "Partidos",
      value: user.stats?.matchesPlayed ?? 0,
      icon: Swords,
    },
    {
      label: "Victorias",
      value: user.stats?.wins ?? 0,
      icon: Medal,
    },
  ];

  return (
    <div className="flex min-h-full flex-col pb-20">
      <div className="px-4 py-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 border-2 border-primary/30">
            <AvatarImage src={user.avatarUrl ?? undefined} />
            <AvatarFallback className="text-xl bg-primary/10 text-primary">
              {getInitials(user.nickname)}
            </AvatarFallback>
          </Avatar>
          <h1 className="mt-3 text-xl font-bold">{user.nickname}</h1>
          <p className="text-sm text-muted-foreground">
            ELO {user.elo} · Nivel {user.level}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-2xl border border-border bg-card p-4"
            >
              <stat.icon className="mb-2 h-5 w-5 text-primary" />
              <span className="text-xl font-bold">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        <nav className="mt-6 space-y-1 rounded-2xl border border-border bg-card p-2">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-card-hover"
            >
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
          <div className="px-1 pt-1">
            <SignOutButton />
          </div>
        </nav>

        <Link
          href={`/players/${user.id}`}
          className="mt-4 block text-center text-xs text-primary"
        >
          Ver perfil completo
        </Link>
      </div>
    </div>
  );
}
