import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ananasCopyPasta, ananasItaly } from "./content";
const token = process.env.DISCORD_TOKEN;

const genAI = new GoogleGenerativeAI(process.env.API_KEY ?? "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(token);

/**
 *
 * STATE
 *
 * TODO: Schlafenszeiten des Bots (Meinte Alfi nicht, dass er zwischen 4 und 8 schläft? -> botreaktionen daktiviert oder fangen damit an, dass er eigentslich schon schlafen will)
 *
 */

// Banger - Alle 10 Minuten besteht die Möglichkeit, dass als reaktion auf eine Nachricht Alfi sagt, wie banger die nachricht ist
let bangerReady = true;

setInterval(() => {
  if (bangerReady) return;
  bangerReady = true;
  console.log("Banger is ready");
}, 600000);

//Message reactions
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  pappnasen();

  const messageString = message.content;
  const splitMessageString = messageString.split(" ");

  // LLM Antwort
  if (
    splitMessageString[0]?.toLowerCase() === "hey" &&
    splitMessageString[1]?.toLowerCase() === "alfi"
  ) {
    const prompt = splitMessageString.slice(2).join(" ");

    try {
      const result = await model.generateContent(
        prompt + " die antwort sollte maximal 2000 zeichen lang sein"
      );
      message.channel.send(result.response.text().substring(0, 2000));
    } catch (error) {
      message.channel.send("Hey Sorry ich weiß auch nicht");
    }

    return;
  }

  // Common Reactions
  if (istAnanasAufPizza(messageString)) {
    if (Math.random() > 0.5) {
      message.channel.send(ananasItaly);
      return;
    } else {
      message.channel.send(ananasCopyPasta);
    }
  }

  if (bangerReady && Math.random() > 0.5) {
    message.channel.send("Banger Nachricht die du da geschrieben hast");
    bangerReady = false;
    return;
  }
});

function istAnanasAufPizza(text: string) {
  const lowerCaseText = text.toLowerCase();
  return (
    (lowerCaseText.includes("ananas") || lowerCaseText.includes("pineapple")) &&
    lowerCaseText.includes("pizza")
  );
}

// Je nach reaktion schreibt er hier alle Stunde, dass ja viele Pappnasen da sind, oder das es echt wenige sind (maybe mit schlafenszeiten? damit nicht nachts die ganze zeit notifications kommen?)
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
        ["online", "idle" /*"dnd"*/].includes(member.presence.status)
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
