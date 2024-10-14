import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { guildStore, pgPool } from "../../index.js";
import { QueryConfig } from "pg";

export const data: CommandData = {
  name: "allow-all-channels",
  description: "Sets if Alfi checks all channels (except blocked channels)",
};

export async function run({ interaction, client, handler }: SlashCommandProps) {
  const pgclient = await pgPool.connect();
  if (interaction.guildId == null) {
    interaction.reply("Error :(");
    return;
  }

  const query: QueryConfig = {
    text: `UPDATE server 
  SET all_channels = NOT all_channels
  WHERE guild_id = $1

  RETURNING all_channels`,
    values: [interaction.guildId],
  };

  const res = await pgclient.query(query);
  const allChannels = res.rows[0].all_channels;

  const appGuild = guildStore.get(interaction.guildId!);

  if (appGuild === undefined) {
    interaction.reply("Error :(");
    return;
  }

  appGuild.all_channels = allChannels;

  interaction.reply(`All Channels set to ${allChannels}`);

  //TODO: Error handling
  //TODO: Hide Message from users (only visible for admins)
  pgclient.release();
}
