import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const serverTable = pgTable("server", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  guild_id: varchar({ length: 255 }).notNull(),
  all_channels: boolean().default(false),
  allowed_channel_ids: varchar({ length: 255 }).array(),
  blocked_channel_ids: varchar({ length: 255 }).array(),
});
