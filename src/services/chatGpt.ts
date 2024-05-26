import OpenAI from "openai";
import { Logger } from "../utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_TOKEN,
});

async function send(message: string) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: message }],
    model: "gpt-4o-2024-05-13",
  });

  const chatResponse = chatCompletion.choices[0].message.content;
  Logger.debug({ message, chatResponse });
  return chatResponse;
}
