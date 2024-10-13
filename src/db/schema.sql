CREATE TABLE server(
    id SERIAL PRIMARY KEY,
    guild_name VARCHAR(255),
    guild_id VARCHAR(255),
    all_channels BOOLEAN,
    allowed_channel_ids VARCHAR(255) [],
    blocked_channel_ids VARCHAR(255) []
)