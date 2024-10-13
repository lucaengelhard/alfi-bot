import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { guildStore, pgclient } from "../../index.js";

export const data: CommandData = {
  name: "allow-all-channels",
  description: "Sets if Alfi checks all channels (except blocked channels)",
};

export function run({ interaction, client, handler }: SlashCommandProps) {
  if (interaction.guildId == null) {
    interaction.reply("Error :(");
    return;
  }
  pgclient
    .query(
      `UPDATE server 
        SET all_channels = NOT all_channels
        WHERE guild_id = '${interaction.guildId}'
        RETURNING all_channels`
    )
    .then((res) => {
      const allChannels = res.rows[0].all_channels;

      const appGuild = guildStore.get(interaction.guildId!);

      if (appGuild === undefined) {
        interaction.reply("Error :(");
        return;
      }

      appGuild.all_channels = allChannels;

      interaction.reply(`All Channels set to ${allChannels}`);
    });
  //TODO: Error handling
  //TODO: Hide Message from users (only visible for admins)
}
