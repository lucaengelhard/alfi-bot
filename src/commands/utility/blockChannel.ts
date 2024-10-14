import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { guildStore, pgclient } from "../../index.js";

export const data: CommandData = {
  name: "block-channel",
  description: "Blocks channel from being checked by Alfi",
};

export async function run({ interaction, client, handler }: SlashCommandProps) {
  await pgclient.connect();
  if (interaction.guildId == null) {
    interaction.reply("Error :(");
    return;
  }
  pgclient
    .query(
      `UPDATE server 
      SET blocked_channel_ids = 

      CASE
        WHEN array_position(blocked_channel_ids, '${interaction.channelId}') IS NULL
        THEN array_append(blocked_channel_ids, '${interaction.channelId}')
        ELSE array_remove(blocked_channel_ids, '${interaction.channelId}')
      END
      WHERE guild_id = '${interaction.guildId}'
      RETURNING blocked_channel_ids`
    )
    .then((res) => {
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
    });
  //TODO: Error handling
  //TODO: Hide Message from users (only visible for admins)
  await pgclient.end();
}
