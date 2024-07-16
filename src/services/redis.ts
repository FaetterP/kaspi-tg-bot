import { createClient } from "redis";
import { Logger } from "../utils";
import { RedisClientType } from "@redis/client";
import { ProductAttribute } from "./kaspi";

const client = createClient();

client.on("error", (err) => {
  Logger.error({ err }, "Redis error");
});

export async function connectRedis() {
  await client.connect();
  Logger.info({}, "Connected to redis");
}

export async function setUserStep(userId: number, step: string) {
  Logger.debug({ step }, "Change step");
  await client.set(`user:${userId}:step`, step);
}

export async function getUserStep(userId: number) {
  const step = await client.get(`user:${userId}:step`);
  return step;
}

export async function setUserAttributes(
  userId: number,
  attributes: ProductAttribute[]
) {
  await client.set(`user:${userId}:attributes`, JSON.stringify(attributes));
}

export async function getUserAttributes(userId: number) {
  const attributes = await client.get(`user:${userId}:attributes`);
  return JSON.parse(attributes || "[]") as ProductAttribute[];
}

export async function pushMessage(
  userId: number,
  message: string
): Promise<void> {
  const key = `${userId}:history`;
  await client.lPush(key, message);
}

export async function getMessages(userId: number): Promise<string[]> {
  const key = `${userId}:history`;
  const messages = await client.lRange(key, 0, -1);
  return messages;
}

export async function clearMessages(userId: number): Promise<void> {
  const key = `${userId}:history`;
  await client.del(key);
}

export async function setCategory(userId: number, category: string) {
  Logger.debug({ step: category }, "Change category");
  await client.set(`user:${userId}:category`, category);
}

export async function getCategory(userId: number) {
  const category = await client.get(`user:${userId}:category`);
  return category!;
}
