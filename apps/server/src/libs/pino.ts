import { pino } from "pino";
import { pinoLoki } from "pino-loki";

export const logger = pino(
    { level: "info" },
    pinoLoki({
        batching: undefined,
        labels: { app: "limpora-server" },
        host: "http://loki:3100",
    }),
);
