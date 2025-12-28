// ? Show errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err instanceof Error ? err.stack : err)
})

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason instanceof Error ? reason.stack : reason)
})

import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import dotenv from 'dotenv'

// Security
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'
import hpp from 'hpp'

// Documentation
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

// Logging
import pinoHttp from 'pino-http'
import logger from './helpers/logger.js'

// Configuration
import SWAGGER_CONFIG from './configs/swagger.js'
import CORS_CONFIG from './configs/cors.js'
import { RATE_LIMIT_CONFIG } from './configs/ratelimit.js'
import { SLOWDOWN_CONFIG } from './configs/slowdown.js'
import { asyncHandler } from './helpers/utils.js'

// Routes

// Database
import { pingDB } from './databases/mysql.js'
import { requiredEnv } from './utils/utils.js'

// Load environment
dotenv.config({ path: '.env' })

const PORT = Number(process.env.PORT) || 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Basic
app.set('port', PORT)
app.use(express.json())

// Security
app.use(cors(CORS_CONFIG))
app.use(helmet())
app.use(helmet.frameguard({ action: 'sameorigin' }))
app.use(helmet.noSniff())
app.use(helmet.hsts())
app.use(helmet.hidePoweredBy())
app.use(helmet.permittedCrossDomainPolicies())
app.use(hpp())
app.use(rateLimit(RATE_LIMIT_CONFIG))
app.use(slowDown(SLOWDOWN_CONFIG))

// Error middleware
app.use((err, req, res, next) => {
    console.error(err)
    res.status(err.status || 500).json({ error: err.message || 'Server error...' })
})

// Public
app.use('/shared', express.static(path.join(__dirname, '../shared')))
app.use(express.static('public'))

// Logging
app.use(pinoHttp({ logger }))

// Connect database

await pingDB();

// Root
app.get(
    '/',
    asyncHandler(async (req, res) => {
        req.log.info('Route /')
        res.status(200).json({ message: 'My Express + MySQL + JS API!' })
    })
)

// API prefix
const API_PREFIX = requiredEnv("API_PREFIX");
const API_VERSION = requiredEnv("API_VERSION");
const PREFIX = `${API_PREFIX}/${API_VERSION}`

logger.info(`Using prefix: ${PREFIX}`)

// Routes
// ! app.use(`${PREFIX}/users`, userRoutes)
// ! app.use(`${PREFIX}/questions`, questionRoutes)
// ! app.use(`${PREFIX}/collections`, collectionRoutes)

// Swagger API Docs
const swaggerSpec = swaggerJSDoc(SWAGGER_CONFIG)
app.use(
    `${PREFIX}/docs`,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'Quiz API Docs',
        customCss: `.swagger-ui .topbar { display: none }`
    })
)

// Finished
app.listen(app.get('port'), () => {
    console.log(`Server running on port ${app.get('port')}`)
})

export default app
