import TelegramBot from "node-telegram-bot-api";
import { setUserStep } from "../services/redis";
import { bot } from "..";

export async function image(
  msg: TelegramBot.Message,
  history: string[]
): Promise<void> {
  await setUserStep(msg.chat.id, "category");

  await bot.sendMessage(
    msg.chat.id,
    "Вот список категорий: todo. Введите нужную."
  );
}
