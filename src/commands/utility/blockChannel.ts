import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { guildStore, pgPool } from "../../index.js";
import { QueryConfig } from "pg";

export const data: CommandData = {
  name: "block-channel",
  description: "Blocks channel from being checked by Alfi",
};

export async function run({ interaction, client, handler }: SlashCommandProps) {
  const pgclient = await pgPool.connect();
  if (interaction.guildId == null) {
    interaction.reply("Error :(");
    return;
  }

  const query: QueryConfig = {
    text: `UPDATE server 
      SET blocked_channel_ids = 

      CASE
        WHEN array_position(blocked_channel_ids, $1) IS NULL
        THEN array_append(blocked_channel_ids, $1)
        ELSE array_remove(blocked_channel_ids, $1)
      END
      WHERE guild_id = $2
      RETURNING blocked_channel_ids`,
    values: [interaction.channelId, interaction.guildId],
  };

  const res = await pgclient.query(query);
  const blocked = res.rows[0].blocked_channel_ids.includes(
    interaction.channelId
  );

  const appGuild = guildStore.get(interaction.guildId!);

  if (appGuild === undefined) {
    interaction.reply("Error :(");
    return;
  }

  appGuild.blocked_channel_ids = res.rows[0].blocked_channel_ids;

  if (blocked) {
    interaction.reply(`Channel ${interaction.channel} blocked`);
  } else {
    interaction.reply(
      `Channel ${interaction.channel} removed from blocked channels`
    );
  }

  console.log(guildStore);

  //TODO: Error handling
  //TODO: Hide Message from users (only visible for admins)
  pgclient.release();
}
