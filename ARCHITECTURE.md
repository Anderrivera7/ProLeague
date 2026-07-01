# ProLeague — Arquitectura

## Visión General

ProLeague sigue una **arquitectura modular por features** inspirada en Clean Architecture y principios SOLID. Cada capa tiene una responsabilidad única y las dependencias fluyen hacia adentro.

```
┌─────────────────────────────────────────────────────────┐
│                    App Router (Pages)                    │
│              Server Components + Client UI               │
├─────────────────────────────────────────────────────────┤
│                   Server Actions                         │
│            Validación Zod + Orquestación                 │
├─────────────────────────────────────────────────────────┤
│                     Services                             │
│         Lógica de negocio (ELO, partidos, torneos)      │
├─────────────────────────────────────────────────────────┤
│                   Repositories                           │
│              Acceso a datos con Prisma                     │
├─────────────────────────────────────────────────────────┤
│              PostgreSQL (Supabase) + Prisma ORM            │
└─────────────────────────────────────────────────────────┘
```

## Estructura de Carpetas

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Rutas públicas de autenticación
│   ├── (dashboard)/        # Rutas protegidas con sidebar
│   └── auth/callback/      # OAuth callback Supabase
├── actions/                # Server Actions (mutaciones)
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── layout/             # Sidebar, Header
│   └── shared/             # StatCard, EmptyState, Skeleton
├── constants/              # Tokens de diseño, config
├── features/               # Módulos por dominio
│   ├── auth/
│   ├── tournaments/
│   ├── matches/
│   ├── players/
│   └── stats/
├── hooks/                  # Custom React hooks
├── lib/                    # Prisma, Supabase, utils
├── repositories/           # Capa de acceso a datos
├── schemas/                # Validación Zod
├── services/               # Lógica de negocio
├── stores/                 # Zustand (estado UI)
├── types/                  # TypeScript types
└── utils/                  # ELO, tournament engine
scripts/
└── fifa-index/             # Puppeteer scrapers (solo servidor)
prisma/
├── schema.prisma           # Modelo de datos completo
└── seed.ts                 # Datos iniciales
```

## Módulos

### Autenticación
- **Supabase Auth** con Google OAuth y email/password
- Middleware protege rutas del dashboard
- Sincronización automática de perfil en PostgreSQL al registrarse

### Torneos
- **TournamentService**: creación, generación de fixtures, eliminación
- **Tournament Engine**: algoritmos round-robin, knockout, grupos
- Tipos: Liga, Eliminación, Grupos, Grupos+Eliminación, Ida y Vuelta

### Partidos
- **MatchService**: registro de resultados en transacción atómica
- Actualiza automáticamente: ELO, stats, H2H, standings, actividad

### Perfil & H2H
- Perfil completo con stats, trofeos, logros, gráfico ELO
- Head to Head al visitar perfil de otro jugador

### FIFA Database
- Scripts Puppeteer en `scripts/fifa-index/`
- Nunca se consulta FIFA Index desde el frontend
- Datos en tablas `fc_teams`, `fc_players`, `fc_leagues`

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15+ App Router |
| UI | TailwindCSS 4 + shadcn/ui |
| Estado servidor | React Query |
| Estado cliente | Zustand |
| Auth | Supabase |
| DB | PostgreSQL + Prisma |
| Validación | Zod + React Hook Form |
| Gráficos | Recharts |
| Animaciones | Framer Motion |

## Configuración

1. Copia `.env.example` a `.env`
2. Configura Supabase (URL, keys, DATABASE_URL)
3. `npx prisma migrate dev`
4. `npx prisma db seed`
5. `npm run dev`

## Scripts

```bash
npm run dev              # Desarrollo
npm run build            # Build producción
npm run scrape:fifa-index  # Scraper FIFA Index
npm run db:migrate       # Migraciones Prisma
npm run db:seed          # Seed inicial
```
