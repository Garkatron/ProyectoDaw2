import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SWAGGER_CONFIG = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Quizz API',
            version: '1.0.0'
        }
    },
    apis: [path.join(__dirname, '../routes/*.js'), path.join(__dirname, '../models/*.js')]
}

export default SWAGGER_CONFIG