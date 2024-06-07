import TelegramBot from "node-telegram-bot-api";
import { setUserStep } from "../services/redis";

export async function start(
  msg: TelegramBot.Message,
  bot: TelegramBot
): Promise<void> {
  await bot.sendMessage(msg.chat.id, "Отправьте изображение.");
  await setUserStep(msg.chat.id, "image");
}
