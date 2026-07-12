import "dotenv/config";
import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 60000,
});

try {
  await client.connect();
  const players = await client.query("SELECT COUNT(*)::int AS n FROM fc_players");
  const teams = await client.query("SELECT COUNT(*)::int AS n FROM fc_teams");
  const users = await client.query("SELECT COUNT(*)::int AS n FROM users");
  console.log("OK Supabase (session pooler)", {
    fc_players: players.rows[0].n,
    fc_teams: teams.rows[0].n,
    users: users.rows[0].n,
  });
} catch (e) {
  console.error("FAIL:", e instanceof Error ? e.message : e);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
