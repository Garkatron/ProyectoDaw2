import { status } from "elysia";
import { logger } from "./libs/pino";

export default async function generateVefCode(): Promise<{
    code: string;
    hashed_code: string;
}> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashed_code = await Bun.password.hash(code, { algorithm: "bcrypt" });
    return { code, hashed_code };
}

export function fail<T extends string>(code: number, message: T): never {
    logger.info({ code }, message);
    throw status(code, message);
}