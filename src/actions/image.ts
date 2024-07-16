import TelegramBot from "node-telegram-bot-api";
import { setUserStep } from "../services/redis";
import { predictCategoryFromImage } from "../services/chatGpt";
import { Logger } from "../utils";

export async function image(
  msg: TelegramBot.Message,
  bot: TelegramBot
): Promise<void> {
  const cat = await predictCategoryFromImage(
    await bot.getFileLink(msg.photo![0].file_id)
  );
  Logger.debug({ cat }, "Predicted category");

  await bot.sendMessage(
    msg.chat.id,
    `Вот список категорий:\n\n${cat.reduce(
      (a, b) => `${a}\n${b}`
    )}\n\n Введите нужную.`
  );

  await setUserStep(msg.chat.id, "category");
}
