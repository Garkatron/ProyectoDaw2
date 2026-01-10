import pino from 'pino'
import fs from 'fs'
import path from 'path'

const logPath = process.env.LOG_FILE_PATH || './logs/app.log'
const logDir = path.dirname(logPath)
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })

const Logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        targets: [
            { target: 'pino-pretty', options: { colorize: true } },
            { target: 'pino/file', options: { destination: logPath } }
        ]
    }
})

export default Logger