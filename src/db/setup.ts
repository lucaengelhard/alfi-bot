import "dotenv/config";
import { env } from "../utils.js";
import pg from "pg";

const { Client: pgClientInit } = pg;
export const pgclient = new pgClientInit({
  connectionString: env("DB_CONNECTIONSTRING"),
  ssl: true,
});

await pgclient.connect();

const res = await pgclient.query("SELECT * FROM server");

console.log(res);
