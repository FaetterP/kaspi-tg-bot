import TelegramBot from "node-telegram-bot-api";
import { setUserStep } from "../services/redis";
import { getProductAttributes } from "../services/kaspi";
import { bot } from "..";

export async function category(
  msg: TelegramBot.Message,
  history: string[]
): Promise<void> {
  const attributes = await getProductAttributes(msg.text!);
  await bot.sendMessage(msg.chat.id, JSON.stringify(attributes, null, 2));

  await setUserStep(msg.chat.id, "attributes");
}
