import TelegramBot from "node-telegram-bot-api";
import { extractAttributes } from "../services/chatGpt";
import { clearMessages, pushMessage, setUserStep } from "../services/redis";
import { importProducts } from "../services/kaspi";
import { bot } from "..";

export async function attributes(
  msg: TelegramBot.Message,
  history: string[]
): Promise<void> {
  const response = await extractAttributes(msg.text!, history);
  if (typeof response === "string") {
    await pushMessage(msg.chat.id, msg.text!);
    await bot.sendMessage(msg.chat.id, response);
  } else {
    importProducts([response]).then(async (a) => {
      await bot.sendMessage(msg.chat.id, "Загружено успешно");
      await clearMessages(msg.chat.id);
      await setUserStep(msg.chat.id, "image");
    });

    await bot.sendMessage(msg.chat.id, "Начинаю загрузку.");
  }
}
