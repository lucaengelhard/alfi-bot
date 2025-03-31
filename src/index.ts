import "dotenv/config";
import path from "node:path";
import { startHealthChecks } from "./health.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { handleMessage } from "./messages.js";
import pg from "pg";
import { env } from "./utils.js";
import { TGuildMap } from "./types.js";
import { getDBguild, testDBConnection } from "./db/db.js";
import { CommandKit } from "commandkit";

/**
 * SETUP
 */

// Open Port
//startHealthChecks();

// Database
const { Pool } = pg;
export const pgPool = new Pool({
  connectionString: env("DB_CONNECTIONSTRING"),
  ssl: false,
});

await testDBConnection();

export const guildStore: TGuildMap = new Map();

// Discord
const token = process.env.DISCORD_TOKEN;

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

// Commands
new CommandKit({
  client,
  commandsPath: path.join(import.meta.dirname, "commands"),
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);

  for (const guild of client.guilds.cache) {
    try {
      const guildObj = await getDBguild(guild[1]);
      guildStore.set(guildObj.guild_id, guildObj);
    } catch (error) {
      console.error(
        `Error while fetching Server ${guild[1].name} | ${
          guild[1].id
        } from Database`,
      );
    }
  }
});

client.login(token);

client.on("guildCreate", async (guild) => {
  const guildObj = await getDBguild(guild);
  guildStore.set(guildObj.guild_id, guildObj);

  console.log(`New Server ${guildObj.guild_id} added`);
});

// LLM
const genAI = new GoogleGenerativeAI(process.env.API_KEY ?? "");
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * State
 */

// Flags
export const flags = {
  bangerReady: true, // Banger - Alle 10 Minuten besteht die Möglichkeit, dass als reaktion auf eine Nachricht Alfi sagt, wie banger die nachricht ist
};

/**
 * Intervalle
 */

// TODO: Intervalle Custom einstellbar machen
// Setzt die bangerReady flag auf true nach einer bestimmten Zeit
setInterval(() => {
  if (flags.bangerReady) return;
  flags.bangerReady = true;
  console.log("Banger ist ready");
}, 600000);

//const res = await pgclient.query("SELECT * FROM server");

/*

TODO: Für die Pappnasen sich noch was ausdenken

- nach bestimmter zeit keine nachrichten zb?

 Je nach reaktion schreibt er hier alle Stunde, dass ja viele Pappnasen da sind, oder das es echt wenige sind (maybe mit schlafenszeiten? damit nicht nachts die ganze zeit notifications kommen?)

setInterval(() => {
    pappnasen();
  }, 3600000);

  function pappnasen() {
    client.guilds.cache.forEach((guild) => {
      const channels = guild.channels.cache.filter((channel) =>
        ["nebenthemen", "allgemein", "general"].includes(channel.name)
      );

      const channelNames = channels.map((channel) => channel.name);

      const users = guild?.members.cache;

      const usersNoBots = users.filter((member) => !member.user.bot);
      const userNotBotsArray = usersNoBots.map((user) => user);

      const usersOnline = usersNoBots.filter(
        (member) =>
          member.presence &&
          ["online", "idle" /"dnd"/].includes(member.presence.status)
      );

      const usersOnlineArray = usersOnline.map((user) => user);
      const sendChannel = channels.at(0);
      if (usersOnlineArray.length >= userNotBotsArray.length / 2) {
        if (sendChannel && sendChannel.isSendable()) {
          sendChannel.send("Das sind ja ganz schön viele Pappnasen hier");
        }
      } else {
        if (sendChannel && sendChannel.isSendable()) {
          sendChannel.send("Wo sind die ganzen Pappnasen?");
        }
      }
    });
  }
*/

/**
 * Message Interaktionen
 */
client.on("messageCreate", async (message) => {
  handleMessage(message, false);
});

/**
 * Postgres Error Handling
 */

pgPool.on("error", async (error) => {
  console.error("pg Error:", error);
});
