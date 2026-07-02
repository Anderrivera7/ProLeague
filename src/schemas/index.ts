import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
    nickname: z
      .string()
      .min(3, "Mínimo 3 caracteres")
      .max(20, "Máximo 20 caracteres")
      .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guión bajo"),
    country: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const profileUpdateSchema = z.object({
  nickname: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
  country: z.string().optional(),
  favoriteTeamId: z.string().uuid().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const tournamentCreateSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100),
  description: z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  type: z.enum(
    ["LEAGUE", "KNOCKOUT", "GROUPS", "GROUPS_KNOCKOUT", "TWO_LEGS"],
    { message: "Selecciona un tipo de torneo válido" }
  ),
  maxParticipants: z.coerce
    .number({ message: "Máx. participantes inválido" })
    .min(2, "Mínimo 2 participantes")
    .max(128, "Máximo 128 participantes"),
  groupsCount: z
    .union([z.coerce.number().min(1).max(16), z.literal(""), z.null(), z.undefined()])
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? undefined : Number(v))),
  teamsPerGroup: z
    .union([z.coerce.number().min(2).max(8), z.literal(""), z.null(), z.undefined()])
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? undefined : Number(v))),
  twoLegs: z.boolean().default(false),
  startDate: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  endDate: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  pointsWin: z.coerce.number().min(1).default(3),
  pointsDraw: z.coerce.number().min(0).default(1),
  pointsLoss: z.coerce.number().min(0).default(0),
});

export const matchResultSchema = z.object({
  matchId: z.string().uuid(),
  homeScore: z.coerce.number().min(0),
  awayScore: z.coerce.number().min(0),
  penaltiesHome: z.coerce.number().min(0).optional(),
  penaltiesAway: z.coerce.number().min(0).optional(),
  mvpUserId: z.string().uuid().optional(),
  events: z.array(
    z.object({
      userId: z.string().uuid(),
      goals: z.coerce.number().min(0).default(0),
      assists: z.coerce.number().min(0).default(0),
      yellowCards: z.coerce.number().min(0).default(0),
      redCards: z.coerce.number().min(0).default(0),
      ownGoals: z.coerce.number().min(0).default(0),
    })
  ),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type TournamentCreateInput = z.infer<typeof tournamentCreateSchema>;
export type MatchResultInput = z.infer<typeof matchResultSchema>;
