import OpenAI from "openai";
import { Logger } from "../utils";
import fs from "node:fs";
import { Product, ProductAttribute, getAttributeValues } from "./kaspi";
import "dotenv/config";

let openai = new OpenAI({
  apiKey: process.env.OPENAI_TOKEN,
});
export function connectOpenAI() {
  Logger.info({}, "Connected to OpenAI");
}

export const categoriesRaw = JSON.parse(
  fs.readFileSync("categories.json", { encoding: "utf-8" })
) as {
  code: string;
  title: string;
}[];

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
  const message = `Твоя задача - определить тип товара на изображении. Можешь дать несколько категорий на английском языке двумя словами. Дай в ответе ТОЛЬКО категории и ничего больше. ОБЯЗАТЕЛЬНО выведи каждую категорию с новой строки.`;
  const response = await sendImage({ message, imageUrl });

  const categories = response!.split("\n");

  const res = new Set<string>();
  for (const category of categories) {
    const founded = fuse.search(category);

    for (const f of founded) {
      res.add(f.item);
    }
  }

  const titles = [...res]
    .map((title) => categoriesRaw.find((cat) => cat.code === title)?.title)
    .filter(Boolean);

  //   const message2 = `Я дал тебе изображение и список категорий (в каждой строке одна категория). Тебе нужно посмотреть на изображение и сказать, какие категории подходят под это изображение.
  // ${titles.join("\n")}

  // В ответе НЕ ПИШИ НИЧЕГО, кроме списка подходящих категорий. Ты должен использовать ТОЛЬКО те категории, которые я тебе прислал. Выведи каждую категорию с новой строки.`;
  //   const response2 = await sendImage({ message: message2, imageUrl });

  // const result = response2!.split("\n");
  const result = titles;
  return result;
}

export async function extractAttributes(
  text: string,
  history: string[],
  attributes: ProductAttribute[],
  category: string
): Promise<Product | string> {
  for (const attr of attributes) {
    if (attr.type === "enum") {
      if (attr.code.toLowerCase().includes("country")) {
        attr.type = "string";
        continue;
      }
      const values = await getAttributeValues(category, attr.code);
      attr.type = values.reduce((a, b) => `${a}|${b.code}`, "");
    }
  }

  const requireType = `{
sku: string;
title: string;
brand: string;
category: "${category}";
description?: string;
attributes: [${attributes.map(
    (attr) =>
      `{ code:${attr.code}, value${attr.mandatory ? "" : "?"}:${attr.type} }`
  )}];
images: { url?: string }[];
}`;

  const textedHistory = [text, ...history].join("\n");

  const message = `Твоя задача - достать все необходимые данные из этого текста.
  ${textedHistory}
  
  Тебе нужно вернуть такой JSON
  ${requireType}
  Вопросительными знаками помечены необязательные поля.
  Вертикальные палочки означают, что принимается ТОЛЬКО одно из перечисленных значений.
  
  Если у тебя есть все данные, пришли ТОЛЬКО заполненный JSON и не пиши больше ничего. ОБЯЗАТЕЛЬНО ПРОВЕРЬ ввёл ли пользователь разрешённые атрибуты (разделённые вертикальной палочкой) и основные поля. Не используй markdown.
  Если пользователь что-то не назвал или прислал неправильные данные, обычным языком попроси его указать недостающие поля.`;
  const response = await sendText(message);

  try {
    return JSON.parse(response) as Product;
  } catch {
    return response;
  }
}

export async function formatAttributesJson(attributes: ProductAttribute[]) {
  const message = `Преобразуй следующий JSON массив в читаемый текст, объясняющий, какие данные необходимы для онлайн магазина.
${JSON.stringify(attributes).replaceAll("\"","")}

Для каждого объекта массива:
code - поле, из которого нужно получить читаемое название
type - ожидаемый тип данных
mandatory - обязательное ли это поле
`;
  const response = await sendText(message);

  return response;
}
