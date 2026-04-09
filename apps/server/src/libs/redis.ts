import { createClient } from "redis";

const redis = createClient({
  socket: {
    host: "redis",
    port: 6379,
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
  ...(process.env.REDIS_PASSWORD ? { password: process.env.REDIS_PASSWORD } : {}),
});

redis.on("error", (err) => console.error("Redis error:", err));

try {
  await redis.connect();
} catch (err) {
  console.error("Redis connection failed, continuing without Redis:", err);
}

export default redis;