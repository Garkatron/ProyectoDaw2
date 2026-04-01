import pino from 'pino'
import PinoLoki from 'pino-loki'

const stream = PinoLoki({
  host: 'http://loki:3100',
  labels: { app: 'limpora-server', env: 'production' },
  propsToLabels: ['level'],
  silenceErrors: false,
  batching: false,
})

stream.on('error', (err: any) => console.error('PINO-LOKI ERROR:', err))

export const logger = pino({ level: 'info' }, stream)

logger.info('pino-loki startup test')