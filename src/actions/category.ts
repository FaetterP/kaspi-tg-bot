import TelegramBot from "node-telegram-bot-api";
import { setUserAttributes, setUserStep } from "../services/redis";
import { getProductAttributes } from "../services/kaspi";
import { formatAttributesJson } from "../services/chatGpt";
import { Logger } from "../utils";

export async function category(
  msg: TelegramBot.Message,
  bot: TelegramBot
): Promise<void> {
  const attributes = await getProductAttributes(msg.text!);
  const text = await formatAttributesJson(attributes);

  await bot.sendMessage(msg.chat.id, text);
  await setUserAttributes(msg.chat.id, attributes);
  await setUserStep(msg.chat.id, "attributes");
}
