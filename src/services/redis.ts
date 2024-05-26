import redis from "redis";
import { Logger } from "../utils";

const client = redis.createClient();

client.on("error", (err) => {
  Logger.error({ err }, "Redis error");
});

export async function setUserStep(userId: string, step: string) {
  await client.set(`user:${userId}:step`, step);
}

export async function getUserStep(userId: string) {
  const step = await client.get(`user:${userId}:step`);
  return step;
}
