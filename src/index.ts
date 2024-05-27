import TelegramBot from "node-telegram-bot-api";
import { getMessages, getUserStep } from "./services/redis";
import { stepMapper } from "./actions";

const token = process.env.TELEGRAM_BOT_TOKEN as string;

export const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  const step = await getUserStep(msg.chat.id);
  const history = await getMessages(msg.chat.id);

  await stepMapper[step || "start"](msg, history);
});
