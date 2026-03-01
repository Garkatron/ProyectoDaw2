import { Elysia } from 'elysia';

// ? Controllers
import { authController } from './modules/auth';
import { userController } from './modules/user';
import { userEarningController } from './modules/user_earnings';
import { servicesController } from './modules/services';
import { reviewsController } from './modules/reviews';

// ? Security
import { cors } from '@elysiajs/cors';
import { rateLimit } from 'elysia-rate-limit';
import { elysiaHelmet, permission } from 'elysiajs-helmet';

// ? Documentation
import openapi from '@elysiajs/openapi';
import { providerServicesController } from './modules/user_services';

// ? Definition
const app = new Elysia()
    // Security
    .use(
        elysiaHelmet({
            csp: Bun.env.NODE_ENV === 'production'
                ? {
                    defaultSrc:  [permission.SELF],
                    scriptSrc:   [permission.SELF, permission.UNSAFE_INLINE, 'https://cdn.jsdelivr.net', 'https://unpkg.com'],
                    styleSrc:    [permission.SELF, permission.UNSAFE_INLINE, 'https://cdn.jsdelivr.net', 'https://unpkg.com'],
                    fontSrc:     [permission.SELF, 'https://cdn.jsdelivr.net'],
                    imgSrc:      [permission.SELF, permission.DATA, permission.HTTPS],
                    connectSrc:  [permission.SELF],
                }
                : {
                    defaultSrc:  [permission.SELF, permission.UNSAFE_INLINE, permission.HTTPS, permission.DATA, permission.BLOB],
                    scriptSrc:   [permission.SELF, permission.UNSAFE_INLINE, permission.HTTPS, permission.BLOB],
                    styleSrc:    [permission.SELF, permission.UNSAFE_INLINE, permission.HTTPS],
                    fontSrc:     [permission.SELF, permission.HTTPS, permission.DATA],
                    imgSrc:      [permission.SELF, permission.DATA, permission.HTTPS, permission.BLOB],
                    connectSrc:  [permission.SELF, permission.HTTPS, permission.BLOB],
                    frameSrc:    [permission.SELF, permission.HTTPS],
                    objectSrc:   [permission.NONE],
                },
            frameOptions:   'SAMEORIGIN',
            xssProtection:  true,
            referrerPolicy: 'strict-origin-when-cross-origin',
        })
    )
    .use(
        rateLimit({
            duration: 60000,
            max: 100,
        })
    )
    // Documentation
    .use(openapi({ path: '/docs' }))

    // Services
    .get('/', () => 'Hello from Limpora!, using Elysia.js!')
    .use(authController)
    .use(userController)
    .use(userEarningController)
    .use(servicesController)
    .use(reviewsController)
    .use(providerServicesController)
    .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app ;
