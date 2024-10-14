import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { guildStore, pgPool } from "../../index.js";
import { QueryConfig } from "pg";
import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("allow-channel")
  .setDescription("Allows channel to be checked by Alfi")
  .addChannelOption((option) =>
    option
      .setName("channel-1")
      .setDescription("Channel to allow or remove from allow list")
  )
  .addChannelOption((option) =>
    option
      .setName("channel-2")
      .setDescription("Channel to allow or remove from allow list")
  )
  .addChannelOption((option) =>
    option
      .setName("channel-3")
      .setDescription("Channel to allow or remove from allow list")
  )
  .addChannelOption((option) =>
    option
      .setName("channel-4")
      .setDescription("Channel to allow or remove from allow list")
  )
  .addChannelOption((option) =>
    option
      .setName("channel-5")
      .setDescription("Channel to allow or remove from allow list")
  );

export async function run({ interaction, client, handler }: SlashCommandProps) {
  const targetChannels: {
    id: string | undefined;
    string: string | undefined;
  }[] = [];

  interaction.options.data.forEach((arg, _index, array) => {
    if (!targetChannels.some((channel) => channel.id === arg.channel?.id)) {
      targetChannels.push({
        id: arg.channel?.id,
        string: arg.channel?.toString(),
      });
    }
  });

  if (targetChannels.length === 0)
    targetChannels.push({
      id: interaction.channel?.id,
      string: interaction.channel?.toString(),
    });

  const pgclient = await pgPool.connect();

  const loopResult = [];

  try {
    await pgclient.query("BEGIN");

    const baseQuery = `UPDATE server 
        SET allowed_channel_ids = 
  
        CASE
          WHEN array_position(allowed_channel_ids, $1) IS NULL
          THEN array_append(allowed_channel_ids, $1)
          ELSE array_remove(allowed_channel_ids, $1)
        END
        WHERE guild_id = $2
        RETURNING allowed_channel_ids`;

    for (const channel of targetChannels) {
      if (channel.id === undefined) continue;
      const res = await pgclient.query(baseQuery, [
        channel.id,
        interaction.guildId,
      ]);

      const allowed = res.rows[0].allowed_channel_ids.includes(channel.id);

      loopResult.push({ ...channel, allowed });
    }
    await pgclient.query("COMMIT");
  } catch (error) {
    await pgclient.query("ROLLBACK");
    console.error(error);

    interaction.reply("Database Error");
  } finally {
    pgclient.release();
  }

  const appGuild = guildStore.get(interaction.guildId!);

  if (appGuild === undefined) {
    interaction.reply("Error :(");
    return;
  }

  appGuild.allowed_channel_ids = loopResult
    .filter((res) => res.allowed && res.id !== undefined)
    .map((res) => res.id!);

  interaction.reply(`Added to allowed Channels: ${loopResult
    .filter((res) => res.allowed)
    .map((res) => res.string)
    .join(" ")}
Removed from allowed Channels: ${loopResult
    .filter((res) => !res.allowed)
    .map((res) => res.string)
    .join(" ")}
    `);

  //TODO: Error handling
  //TODO: Hide Message from users (only visible for admins)
}
