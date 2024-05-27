import redis from "redis";
import { Logger } from "../utils";

const client = redis.createClient();

client.on("error", (err) => {
  Logger.error({ err }, "Redis error");
});

export async function setUserStep(userId: number, step: string) {
  await client.set(`user:${userId}:step`, step);
}

export async function getUserStep(userId: number) {
  const step = await client.get(`user:${userId}:step`);
  return step;
}

export async function pushMessage(userId: number, message: string): Promise<void> {
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
