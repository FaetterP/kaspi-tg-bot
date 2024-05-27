import TelegramBot from "node-telegram-bot-api";
import { bot } from "..";
import { setUserStep } from "../services/redis";

export async function start(
  msg: TelegramBot.Message,
  history: string[]
): Promise<void> {
  await bot.sendMessage(msg.chat.id, "Отправьте изображение.");
  await setUserStep(msg.chat.id, "image");
}
