import pino from "pino";

export const logger = pino({
    level: "info",
    transport: {
        target: "pino-loki",
        options: {
            batching: true,
            interval: 5, 
            labels: { app: "limpora-server" },
            host: "http://127.0.0.1:3100", 
        },
    },
});