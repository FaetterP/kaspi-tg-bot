import OpenAI from "openai";
import { Logger } from "../utils";
import fs from "node:fs";
import fuzzy from "fuzzy";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_TOKEN,
});

const a = openai.files.create({
  file: fs.createReadStream("categories.json"),
  purpose: "fine-tune",
});

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
  return chatResponse;
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
  console.log({ a: await a });
  const message = `Твоя задача - однозначно определить тип товара на изображении. Дай в ответе ТОЛЬКО категорию и ничего больше. Для определения типа используй этот файл ${JSON.stringify(
    await a
  )}`;
  const response = await sendImage({ message, imageUrl });

  const ar = fuzzy.filter(response!, categoriesCodes);
}
