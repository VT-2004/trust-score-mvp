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
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      rating INT NOT NULL,
      reviewer_role TEXT,
      comment TEXT NOT NULL,
      candidate_analyzed TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Recruiter',
      avatar TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  initialized = true;
}

export async function createUser({ name, email, passwordHash, role, avatar }) {
  await ensureInitialized();
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, avatar, created_at)
     VALUES ($1, $2, $3, $4, $5, now())
     RETURNING id, name, email, role, avatar, created_at`,
    [name, email.toLowerCase().trim(), passwordHash, role || 'Recruiter', avatar || '']
  );
  return result.rows[0];
}

export async function getUserByEmail(email) {
  await ensureInitialized();
  const result = await pool.query(
    `SELECT id, name, email, password_hash, role, avatar, created_at FROM users WHERE email = $1`,
    [email.toLowerCase().trim()]
  );
  return result.rows[0] || null;
}

export async function getUserById(id) {
  await ensureInitialized();
  const result = await pool.query(
    `SELECT id, name, email, role, avatar, created_at FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
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

// Public feed: most recent reports across ALL users, for a dashboard view.
// Returns full report_json so the frontend can render each card's scores and
// expand to the full breakdown without a second fetch per card.
export async function listRecentReports(limit = 30) {
  await ensureInitialized();
  const result = await pool.query(
    "SELECT id, username, created_at, report_json FROM reports ORDER BY created_at DESC LIMIT $1",
    [limit]
  );
  return result.rows;
}

// Get the most recent report for a single user (for caching)
export async function getLatestReportForUser(username) {
  await ensureInitialized();
  const result = await pool.query(
    "SELECT id, username, created_at, report_json FROM reports WHERE LOWER(username) = LOWER($1) ORDER BY created_at DESC LIMIT 1",
    [username]
  );
  return result.rows[0] || null;
}

// Reviews & Ratings
export async function saveReview({ username, rating, reviewerRole, comment, candidateAnalyzed }) {
  await ensureInitialized();
  const result = await pool.query(
    "INSERT INTO reviews (username, rating, reviewer_role, comment, candidate_analyzed, created_at) VALUES ($1, $2, $3, $4, $5, now()) RETURNING id, created_at",
    [username || "Anonymous Tester", rating || 5, reviewerRole || "Tester", comment || "", candidateAnalyzed || ""]
  );
  return result.rows[0];
}

export async function listReviews(limit = 50) {
  await ensureInitialized();
  const result = await pool.query(
    "SELECT id, username, rating, reviewer_role, comment, candidate_analyzed, created_at FROM reviews ORDER BY created_at DESC LIMIT $1",
    [limit]
  );
  return result.rows;
}

export default pool;