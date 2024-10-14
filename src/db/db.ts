import { Guild } from "discord.js";
import { TDBGuild } from "../types.js";
import { pgclient } from "../index.js";

export async function getDBguild(guild: Guild) {
  const guildObj: TDBGuild = {
    guild_id: guild.id,
    guild_name: guild.name,
    all_channels: null,
    allowed_channel_ids: null,
    blocked_channel_ids: null,
  };

  let dbExists = false;

  // TODO Parameterrize all queries https://node-postgres.com/features/queries#query-config-object
  const res = await pgclient.query(
    `SELECT * FROM server WHERE guild_id='${guild.id}'`
  );

  const dbObj = res.rows[0] as TDBGuild;

  dbExists = dbObj !== undefined;

  if (!dbExists) {
    const res = await pgclient.query(
      `INSERT INTO server(guild_name, guild_id,all_channels) VALUES ('${
        guild.name
      }', '${guild.id}', ${false})`
    );
    console.log(`New Server ${guild.id} | ${guild.name} registered in db`);

    return guildObj;
  } else {
    console.log(`Server ${guild.id} | ${guild.name} fetched from db`);

    return dbObj;
  }
}
