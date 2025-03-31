import { Pool } from "pg";
import { env } from "../utils.js";

export const pool = new Pool({
  connectionString: env("DB_CONNECTIONSTRING"),
  ssl: false,
});

export async function runMigrations() {
  try {
    const schemaSQL = `
    CREATE TABLE server(
      id SERIAL PRIMARY KEY,
      guild_name VARCHAR(255),
      guild_id VARCHAR(255),
      all_channels BOOLEAN,
      allowed_channel_ids VARCHAR(255) [],
      blocked_channel_ids VARCHAR(255) []
    )
    `;

    await pool.query(schemaSQL);
    console.log("✅ Database migration completed!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await pool.end();
  }
}
