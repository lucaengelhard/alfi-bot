import { pgPool } from "../index.js";

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

    await pgPool.query(schemaSQL);
    console.log("✅ Database migration completed!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await pgPool.end();
  }
}
