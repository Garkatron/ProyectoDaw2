
const CORS_CONFIG = {
    origin: [process.env.CLIENT_BASE_URL || 'http://localhost:3000', 'https://www.getpostman.com'], // Allow requests only from these origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
    // headers: 'Content-Type, Authorization, Content-Length, X-Requested-With',
}

export default { CORS_CONFIG }