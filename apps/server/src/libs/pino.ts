import pino from "pino";

export const logger = pino({
  level: "info",
  transport: {
    target: "pino-loki",
    options: {
      batching: true,
      interval: 5, 
      labels: { app: "limpora-server" },
      host: "http://loki:3100", 
    },
  },
});