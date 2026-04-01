import pino from 'pino'
import PinoLoki from 'pino-loki';


const stream = PinoLoki({
  host: 'http://loki:3100',
  labels: { app: 'limpora-server', env: 'production' },
  propsToLabels: ['level'],
  silenceErrors: false,
  batching: {
    interval: 5,
    maxBufferSize: 1000,
  },
})

export const logger = pino({ level: 'info' }, stream)