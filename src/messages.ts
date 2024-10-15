import {
  DMChannel,
  Message,
  MessageCreateOptions,
  MessagePayload,
  NewsChannel,
  OmitPartialGroupDMChannel,
  PartialDMChannel,
  PrivateThreadChannel,
  PublicThreadChannel,
  StageChannel,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { flags, guildStore, model } from "./index.js";
import { ananasCopyPasta, ananasEnding, ananasItaly } from "./content.js";
import { env } from "./utils.js";

/**
 *
 * @param message Das Message-Objekt
 * @param bots boolean, der definiert, on bot-messages auch verarbeitet werden sollen
 */
export async function handleMessage(
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  bots?: boolean
) {
  if (message.author.bot && bots === false) {
    console.log("Bot Message");
    return;
  }

  const guildObj = guildStore.get(message.guildId ?? "");

  if (guildObj === undefined) {
    console.error(
      "Message sent to Server that is not in guildStore",
      message.guildId
    );

    return;
  }

  // Cancel wenn channelid in den blockierten channeln und wenn nicht in den erlaubten channeln
  if (guildObj.blocked_channel_ids?.includes(message.channelId)) {
    console.log(
      `Blocked Channel ${message.channelId} on ${message.guildId} (blocked Channel)`
    );
    return;
  }
  if (
    !guildObj.all_channels &&
    !guildObj.allowed_channel_ids?.includes(message.channelId)
  ) {
    console.log(
      `Blocked Channel ${message.channelId} on ${message.guildId} (not Allowed)`
    );
    return;
  }

  console.log(`Recieved Message: ${message.content}`);

  const messageString = message.content;
  const ananas = istAnanasAufPizza(messageString);

  let resultString = "Hey Sorry ich weiß auch nicht";

  // check if "hey alfi" -> exit function early
  if (checkHeyAlfi(messageString)) {
    message.channel.sendTyping();
    resultString = await llmAnswer({
      ananas,
      messageString,
    });

    send({ channel: message.channel, message: resultString });
    return;
  }

  if (ananas) {
    message.channel.sendTyping();
    if (Math.random() > 0.5) {
      send({ channel: message.channel, message: ananasItaly });
    } else {
      send({ channel: message.channel, message: ananasCopyPasta });
    }
  }

  if (flags.bangerReady && Math.random() > 0.5) {
    message.channel.sendTyping();
    send({
      channel: message.channel,
      message: "Banger Nachricht die du da geschrieben hast",
    });
    flags.bangerReady = false;
  }
}

type Channel =
  | DMChannel
  | PartialDMChannel
  | NewsChannel
  | StageChannel
  | TextChannel
  | PublicThreadChannel<boolean>
  | PrivateThreadChannel
  | VoiceChannel;

export function send({
  channel,
  message,
}: {
  channel: Channel;
  message: string | MessagePayload | MessageCreateOptions;
}) {
  if (typeof message !== "string") {
    // TODO: Andere Formen von Messages verarbeiten
    return;
  }
  const truncated = message.substring(0, 2000);

  try {
    channel.send(truncated);
    console.log(`Message ${truncated} sent to:`); //TODO: Logging von Server und Channel)
  } catch (error) {
    console.error(`Error while sending Message ${truncated} to:`); //TODO: Logging von Server und Channel)
    channel.send("Hey Sorry ich weiß auch nicht");
  }
}

function checkHeyAlfi(messageString: string) {
  const splitMessageString = messageString.split(" ");
  const hey = splitMessageString[0]?.toLowerCase();
  const alfi = splitMessageString[1]?.toLowerCase();

  if (hey === undefined || alfi === undefined) return false;
  if (!["hey", "heey", "heyy", "heeyy", "hei"].includes(hey)) return false; //TODO: Mehr schreibweisen?
  if (!["alfi", "alfii", "alfredo"].includes(alfi)) return false;

  return true;
}

async function llmAnswer({
  messageString,
  ananas,
}: {
  messageString: string;
  ananas: boolean;
}) {
  // TODO: Auf vorherige Nachrichten eingehen

  console.log("Getting LLM Answer");

  const promptStart = ""; // TODO: Mehr Charakter geben
  const promptEnd = "die antwort sollte maximal 2000 zeichen lang sein";

  const prompt = messageString.split(" ").slice(2).join(" ");

  const result = await model.generateContent(
    `${promptStart} ${prompt} ${promptEnd}`
  );

  let resultString = result.response.text();

  if (ananas) {
    resultString = resultString.substring(0, 2000 - (ananasEnding.length + 5));
    resultString = `${resultString} ${ananasEnding}`;
  }

  return resultString;
}

/**
 *
 * @param text
 * @returns ein boolean, der definiert ob in der Nachricht Ananas auf Pizza erwähnt wird
 */
function istAnanasAufPizza(text: string) {
  const lowerCaseText = text.toLowerCase();
  return (
    (lowerCaseText.includes("ananas") || lowerCaseText.includes("pineapple")) &&
    lowerCaseText.includes("pizza")
  );
}
