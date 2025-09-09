import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';

const redis = new Redis(process.env.REDIS_URL as string);
const prisma = new PrismaClient();

export async function getClientCached(clientId: string) {
  const cacheKey = `oidc:client:${clientId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const client = await prisma.client.findUnique({ where: { clientId } });
  if (client) {
    await redis.set(cacheKey, JSON.stringify(client), 'EX', 300); // cache 5 min
  }
  return client;
}
