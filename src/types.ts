export type TDBGuild = {
  guild_id: string;
  guild_name: string;
  all_channels: boolean | null;
  allowed_channel_ids: string[] | null;
  blocked_channel_ids: string[] | null;
};

export type TGuildMap = Map<TDBGuild["guild_id"], TDBGuild>;
