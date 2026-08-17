import pg from "pg";

const { Pool } = pg;

// DATABASE_URL comes from your Postgres provider (e.g. Neon, Supabase).
// Render's free web services wipe local files on every redeploy, so SQLite
// doesn't survive — a hosted Postgres instance does, and this is a thin
// wrapper so the rest of the app (server.js) doesn't need to change at all.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("localhost")
    ? false
    : { rejectUnauthorized: false }, // most free Postgres hosts (Neon, Supabase) require SSL
});

let initialized = false;
async function ensureInitialized() {
  if (initialized) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      report_json JSONB NOT NULL
    );
  `);
  initialized = true;
}

export async function saveReport(username, reportObj) {
  await ensureInitialized();
  const result = await pool.query(
    "INSERT INTO reports (username, created_at, report_json) VALUES ($1, now(), $2) RETURNING id",
    [username, JSON.stringify(reportObj)]
  );
  return result.rows[0].id;
}

export async function getReport(id) {
  await ensureInitialized();
  const result = await pool.query("SELECT * FROM reports WHERE id = $1", [id]);
  const row = result.rows[0];
  if (!row) return null;
  // report_json comes back already parsed as an object since the column is JSONB
  return row;
}

export async function listReportsForUser(username) {
  await ensureInitialized();
  const result = await pool.query(
    "SELECT id, username, created_at FROM reports WHERE username = $1 ORDER BY created_at DESC",
    [username]
  );
  return result.rows;
}

export default pool;