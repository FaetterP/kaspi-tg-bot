import TelegramBot from "node-telegram-bot-api";
import { setCategory, setUserAttributes, setUserStep } from "../services/redis";
import { getProductAttributes } from "../services/kaspi";
import { categoriesRaw, formatAttributesJson } from "../services/chatGpt";
import { Logger } from "../utils";

export async function category(
  msg: TelegramBot.Message,
  bot: TelegramBot
): Promise<void> {
  const attributes = await getProductAttributes(msg.text!);
  const text = await formatAttributesJson(attributes);
  const category = categoriesRaw.find((c) => c.title === msg.text)!.code;
  await setCategory(msg.chat.id, category);

  await bot.sendMessage(msg.chat.id, text, { parse_mode: "MarkdownV2" });
  await setUserAttributes(msg.chat.id, attributes);
  await setUserStep(msg.chat.id, "attributes");
}
