import pino from 'pino'
import PinoLoki, { LokiOptions } from 'pino-loki'


const transport = pino.transport<LokiOptions>({
  target: "pino-loki",
  options: {
    host: 'http://loki:3100',
    basicAuth: undefined
  },
});

export const logger = pino(transport);
