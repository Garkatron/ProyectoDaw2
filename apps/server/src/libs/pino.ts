import pino from 'pino'
import pinoLoki from 'pino-loki'

const transport = pino.transport({
  target: 'pino-loki',
  options: {
    batching: true,
    interval: 5,
    host: 'http://localhost:3100',
    labels: { app: 'mi-app', env: 'production' },
  },
})

export const logger = pino({ level: 'info' }, transport)