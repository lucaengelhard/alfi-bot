import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

// State
let bangerReady = true;

setInterval(() => {
  if (bangerReady) return;
  bangerReady = true;
  console.log("Banger is ready");
}, 600000);

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

    const result = await model.generateContent(
      prompt + " die antwort sollte maximal 2000 zeichen lang sein"
    );

    message.channel.send(result.response.text().substring(0, 2000));
    return;
  }

  // Common Reactions
  if (istAnanasAufPizza(messageString)) {
    message.channel.send(
      "🇮🇹🤌🇮🇹🤌🇮🇹🤌 ANANAS AUF PIZZA IST EIN HASSVERBRECHEN 🇮🇹🤌🇮🇹🤌🇮🇹🤌"
    );
    return;
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

function pappnasen() {
  client.guilds.cache.forEach((guild) => {
    const usersOnline = guild?.members.cache.filter(
      (member) =>
        member.presence &&
        ["online", "idle", "dnd"].includes(member.presence.status)
    );

    console.log(usersOnline?.map((user) => user.user.tag));
  });
}
