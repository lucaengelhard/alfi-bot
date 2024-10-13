import "dotenv/config";
import { env } from "../utils.js";
import pg from "pg";

const { Client: pgClientInit } = pg;
export const pgclient = new pgClientInit({
  user: env("PROD_DB_USER"),
  password: env("PROD_DB_PASSWORD"),
  host: env("PROD_DB_HOST"),
  database: env("PROD_DB_NAME"),
  ssl: true,
});

await pgclient.connect();

/* const res = await pgclient.query(`CREATE TABLE server(
    id SERIAL PRIMARY KEY,
    guild_name VARCHAR(255),
    guild_id VARCHAR(255),
    all_channels BOOLEAN,
    allowed_channel_ids VARCHAR(255) [],
    blocked_channel_ids VARCHAR(255) []
)`); */

const res = await pgclient.query("SELECT * FROM server");

console.log(res);
