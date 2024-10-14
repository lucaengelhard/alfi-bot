import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { guildStore, pgPool } from "../../index.js";
import { QueryConfig } from "pg";
import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("block-channel")
  .setDescription("Blocks channel from being checked by Alfi")
  .addChannelOption((option) =>
    option
      .setName("channel-1")
      .setDescription("Channel to block or remove from block list")
  )
  .addChannelOption((option) =>
    option
      .setName("channel-2")
      .setDescription("Channel to block or remove from block list")
  )
  .addChannelOption((option) =>
    option
      .setName("channel-3")
      .setDescription("Channel to block or remove from block list")
  )
  .addChannelOption((option) =>
    option
      .setName("channel-4")
      .setDescription("Channel to block or remove from block list")
  )
  .addChannelOption((option) =>
    option
      .setName("channel-5")
      .setDescription("Channel to block or remove from block list")
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

  const loopResult: {
    blocked: boolean;
    id: string | undefined;
    string: string | undefined;
  }[] = [];

  try {
    await pgclient.query("BEGIN");

    const baseQuery = `UPDATE server 
        SET blocked_channel_ids = 
  
        CASE
          WHEN array_position(blocked_channel_ids, $1) IS NULL
          THEN array_append(blocked_channel_ids, $1)
          ELSE array_remove(blocked_channel_ids, $1)
        END
        WHERE guild_id = $2
        RETURNING blocked_channel_ids`;

    for (const channel of targetChannels) {
      if (channel.id === undefined) continue;
      const res = await pgclient.query(baseQuery, [
        channel.id,
        interaction.guildId,
      ]);

      const blocked = res.rows[0].blocked_channel_ids.includes(channel.id);
      loopResult.push({ ...channel, blocked });
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

  appGuild.blocked_channel_ids = loopResult
    .filter((res) => res.blocked && res.id !== undefined)
    .map((res) => res.id!);

  interaction.reply(`Added to allowed Channels: ${loopResult
    .filter((res) => res.blocked)
    .map((res) => res.string)
    .join(" ")}
Removed from allowed Channels: ${loopResult
    .filter((res) => !res.blocked)
    .map((res) => res.string)
    .join(" ")}
    `);

  //TODO: Error handling
  //TODO: Hide Message from users (only visible for admins)
}
