import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { guildStore, pgclient } from "../../index.js";
import { TDBGuild } from "../../types.js";

export const data: CommandData = {
  name: "status",
  description: "List Alfi Status",
};

export async function run({ interaction, client, handler }: SlashCommandProps) {
  await pgclient.connect();
  pgclient
    .query(
      `SELECT * from server 
          WHERE guild_id = '${interaction.guildId}'`
    )
    .then((res) => {
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
    });
  //TODO: Error handling
  //TODO: Hide Message from users (only visible for admins)

  await pgclient.end();
}
