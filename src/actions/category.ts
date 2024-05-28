import TelegramBot from "node-telegram-bot-api";
import { setUserAttributes, setUserStep } from "../services/redis";
import { getProductAttributes } from "../services/kaspi";
import { bot } from "..";

export async function category(
  msg: TelegramBot.Message,
  history: string[]
): Promise<void> {
  const attributes = await getProductAttributes(msg.text!);
  await bot.sendMessage(msg.chat.id, JSON.stringify(attributes, null, 2));

  await setUserAttributes(msg.chat.id, attributes);
  await setUserStep(msg.chat.id, "attributes");
}
