import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { guildStore, pgPool } from "../../index.js";
import { TDBGuild } from "../../types.js";
import { QueryConfig } from "pg";

export const data: CommandData = {
  name: "status",
  description: "List Alfi Status",
};

export async function run({ interaction, client, handler }: SlashCommandProps) {
  const pgclient = await pgPool.connect();

  const query: QueryConfig = {
    text: `SELECT * from server 
          WHERE guild_id = $1`,
    values: [interaction.guildId],
  };

  const res = await pgclient.query(query);
  const guild = res.rows[0] as TDBGuild;

  interaction.reply(
    `**${guild.guild_name}** \nAll Channels: ${
      guild.all_channels
    }\nAllowed Channels: ${guild.allowed_channel_ids
      ?.map((id) => `<#${id}>`)
      .join(" ")} \nBlocked Channels:  ${guild.blocked_channel_ids
      ?.map((id) => `<#${id}>`)
      .join(" ")}`
  );

  //TODO: Error handling
  //TODO: Hide Message from users (only visible for admins)

  pgclient.release();
}
