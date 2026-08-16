import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "..", "trust-score.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    created_at TEXT NOT NULL,
    report_json TEXT NOT NULL
  );
`);

export function saveReport(username, reportObj) {
  const stmt = db.prepare(
    "INSERT INTO reports (username, created_at, report_json) VALUES (?, ?, ?)"
  );
  const info = stmt.run(username, new Date().toISOString(), JSON.stringify(reportObj));
  return info.lastInsertRowid;
}

export function getReport(id) {
  const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(id);
  if (!row) return null;
  return { ...row, report_json: JSON.parse(row.report_json) };
}

export function listReportsForUser(username) {
  return db
    .prepare("SELECT id, username, created_at FROM reports WHERE username = ? ORDER BY created_at DESC")
    .all(username);
}

export default db;
