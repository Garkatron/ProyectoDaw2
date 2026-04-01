import pino from 'pino'
import PinoLoki from 'pino-loki'
import { multistream } from 'pino'

const lokiStream = PinoLoki({
  host: 'http://loki:3100',
  labels: { app: 'limpora-server', env: 'production' },
  silenceErrors: false,
  batching: false,
})

lokiStream.on('error', (err: any) => console.error('LOKI ERROR:', err))

export const logger = pino(
  { level: 'info' },
  multistream([
    { stream: process.stdout },   
    { stream: lokiStream },       
  ])
)

logger.info('startup test')