import { createClient } from "redis";

const redis = createClient({
    url: "redis://redis:6379",
    password: process.env.REDIS_PASSWORD,
    
});

await redis.connect();
export default redis;


