import pino from 'pino'
import type { LokiOptions } from 'pino-loki'

const transport = pino.transport<LokiOptions>({
  target: 'pino-loki',
  options: {
    host: 'http://loki:3100',
    labels: { app: 'limpora-server', env: 'production' },
    propsToLabels: ['level'],
    batching: {
      interval: 5,
      maxBufferSize: 1000,
    },
  },
})
export const logger = pino(transport)