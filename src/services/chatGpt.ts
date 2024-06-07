import OpenAI from "openai";
import { Logger } from "../utils";
import fs from "node:fs";
import fuzzy from "fuzzy";
import { Product, ProductAttribute } from "./kaspi";
import "dotenv/config";

let openai = new OpenAI({
  apiKey: process.env.OPENAI_TOKEN,
});
export function connectOpenAI() {
  Logger.info({}, "Connected to OpenAI");
}

const categories = JSON.parse(
  fs.readFileSync("categories.json", { encoding: "utf-8" })
) as {
  code: string;
  title: string;
}[];
const categoriesCodes = categories.map((cat) => cat.code);

async function sendText(message: string) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: message }],
    model: "gpt-4o-2024-05-13",
  });

  const chatResponse = chatCompletion.choices[0].message.content;
  Logger.debug({ message, chatResponse });
  return chatResponse!;
}

async function sendImage({
  message,
  imageUrl,
}: {
  message: string;
  imageUrl: string;
}) {
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o-2024-05-13",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: message },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
  });

  const chatResponse = chatCompletion.choices[0].message.content;
  Logger.debug({ message, imageUrl, chatResponse });
  return chatResponse;
}

export async function predictCategoryFromImage(imageUrl: string) {
  const message = `Твоя задача - однозначно определить тип товара на изображении. Дай в ответе ТОЛЬКО категорию и ничего больше. Для определения категории прочитай этот файл, в нём перечислены все доступные категории ${process.env.CATEGORIES_URL} Можешь использовать не весь файл. Дай ответ именно такой как поле code в этом файле.`;
  const response = await sendImage({ message, imageUrl });

  const ar = fuzzy.filter(response!, categoriesCodes);
  return ar.map((a) => a.original);
}

export async function extractAttributes(
  text: string,
  history: string[],
  attributes: ProductAttribute[]
): Promise<Product | string> {
  const message = `Твоя задача - достать атрибуты из сообщения. Пользователь сказал вот это: "${text}". До этого он говорил ${
    history.length ? history.reduce((a, b) => `${a}\n${b}`) : "ничего"
  }. \n\n Вот список всех полей: ${JSON.stringify(attributes[0]).replaceAll(
    '"',
    ""
  )}. Если у тебя все данные есть, пришли ТОЛЬКО заполненный json и не пиши больше ничего. Json обязан соблюдать тип 
  { sku?: string; title: string; brand?: string; category: string; description?: string; attributes: { code: string; value: string; }[]; images?: { url: string; }[]; }
   Если пользователь что-то не назвал, обычным языком попроси его указать недостающие поля.`;
  const response = await sendText(message);

  try {
    return JSON.parse(response) as Product;
  } catch {
    return response;
  }
}

export async function formatAttributesJson(attributes: ProductAttribute[]) {
  const message = `Ты сейчас получишь json объект. Твоя задача - достать из него данные и оформить их в виде обычного читабельного текста. Скажи, что пользователь должен заполнить. \n${JSON.stringify(
    attributes
  )}`;
  const response = await sendText(message);

  return response;
}
