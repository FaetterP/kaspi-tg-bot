import TelegramBot from "node-telegram-bot-api";
import { attributes } from "./attributes";
import { image } from "./image";
import { category } from "./category";
import { start } from "./start";

type StepHandler = (msg: TelegramBot.Message, history: string[]) => Promise<void>;

export const stepMapper: Record<string, StepHandler> = {
  attributes,
  image,
  category,
  start,
};
