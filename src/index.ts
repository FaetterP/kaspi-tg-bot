import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import {
  clearMessages,
  connectRedis,
  getUserStep,
  setUserStep,
} from "./services/redis";
import { stepMapper } from "./actions";

const token = process.env.TELEGRAM_BOT_TOKEN as string;

(async () => {
  await connectRedis();

  const debugCHatId = +process.env.DEBUG_TG_CHAT_ID!;
  if (debugCHatId) {
    await setUserStep(debugCHatId, "start");
    await clearMessages(debugCHatId!);
  }

  const bot = new TelegramBot(token, { polling: true });

  bot.on("message", async (msg) => {
    const step = await getUserStep(msg.chat.id);
    await stepMapper[step || "start"](msg, bot);
  });
})();
