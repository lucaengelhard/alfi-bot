import { Guild } from "discord.js";
import { TDBGuild } from "../types.js";
import { pgPool } from "../index.js";
import { QueryConfig } from "pg";

export async function getDBguild(guild: Guild) {
  const pgclient = await pgPool.connect();
  const guildObj: TDBGuild = {
    guild_id: guild.id,
    guild_name: guild.name,
    all_channels: null,
    allowed_channel_ids: null,
    blocked_channel_ids: null,
  };

  let dbExists = false;

  const query: QueryConfig = {
    text: "SELECT * FROM server WHERE guild_id=$1",
    values: [guild.id],
  };

  // TODO Parameterrize all queries https://node-postgres.com/features/queries#query-config-object
  const res = await pgclient.query(query);

  const dbObj = res.rows[0] as TDBGuild;

  dbExists = dbObj !== undefined;

  if (!dbExists) {
    const res = await pgclient.query(
      `INSERT INTO server(guild_name, guild_id,all_channels) VALUES ('${
        guild.name
      }', '${guild.id}', ${false})`
    );
    console.log(`New Server ${guild.id} | ${guild.name} registered in db`);

    pgclient.release();
    return guildObj;
  } else {
    console.log(`Server ${guild.id} | ${guild.name} fetched from db`);

    pgclient.release();
    return dbObj;
  }
}
