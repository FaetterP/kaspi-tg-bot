import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_BOT_TOKEN as string;

const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
    
});
