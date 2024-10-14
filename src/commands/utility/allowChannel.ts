import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { guildStore, pgPool } from "../../index.js";
import { QueryConfig } from "pg";

export const data: CommandData = {
  name: "allow-channel",
  description: "Allows channel to be checked by Alfi",
};

export async function run({ interaction, client, handler }: SlashCommandProps) {
  const pgclient = await pgPool.connect();
  const query: QueryConfig = {
    text: `UPDATE server 
        SET allowed_channel_ids = 
  
        CASE
          WHEN array_position(allowed_channel_ids, $1) IS NULL
          THEN array_append(allowed_channel_ids, $1)
          ELSE array_remove(allowed_channel_ids, $1)
        END
        WHERE guild_id = $2
        RETURNING allowed_channel_ids`,
    values: [interaction.channelId, interaction.guildId],
  };

  const res = await pgclient.query(query);
  const blocked = res.rows[0].allowed_channel_ids.includes(
    interaction.channelId
  );

  const appGuild = guildStore.get(interaction.guildId!);

  if (appGuild === undefined) {
    interaction.reply("Error :(");
    return;
  }

  appGuild.allowed_channel_ids = res.rows[0].allowed_channel_ids;

  if (blocked) {
    interaction.reply(`Channel ${interaction.channel} allowed`);
  } else {
    interaction.reply(
      `Channel ${interaction.channel} removed from allowed channels`
    );
  }

  //TODO: Error handling
  //TODO: Hide Message from users (only visible for admins)
  pgclient.release();
}
