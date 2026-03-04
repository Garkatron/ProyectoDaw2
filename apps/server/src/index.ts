import { Elysia } from "elysia";

// ? Controllers
import { authController } from "./modules/auth";
import { userController } from "./modules/user";
import { userEarningController } from "./modules/user_earnings";
import { servicesController } from "./modules/services";
import { reviewsController } from "./modules/reviews";

// ? Security
import { cors } from "@elysiajs/cors";
import { rateLimit } from "elysia-rate-limit";

// ? Documentation
import openapi from "@elysiajs/openapi";
import { providerServicesController } from "./modules/provider_services";
import { logger } from "@bogeychan/elysia-logger";
import { bookingController } from "./modules/booking";

// import { elysiaHelmet, permission } from 'elysiajs-helmet';

const securityHeaders = new Elysia({ name: "security-headers" }).onRequest(
    ({ set }) => {
        set.headers["X-Frame-Options"] = "SAMEORIGIN";
        set.headers["X-XSS-Protection"] = "1; mode=block";
        set.headers["X-Content-Type-Options"] = "nosniff";
        set.headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

        if (Bun.env.NODE_ENV === "production") {
            set.headers["Strict-Transport-Security"] =
                "max-age=31536000; includeSubDomains";
            set.headers["Content-Security-Policy"] = [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
                "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
                "font-src 'self' https://cdn.jsdelivr.net",
                "img-src 'self' data: https:",
                "connect-src 'self'",
            ].join("; ");
        }
    },
);

// ? Definition
const app = new Elysia()
    .use(
        logger({
            transport: {
                target: "pino-pretty",
            },
        }),
    )
    // Security
    .use(
        cors({
            origin:
                Bun.env.NODE_ENV === "production"
                    ? (Bun.env.FRONTEND_URL ?? "https://www.limpora.xyz")
                    : true,
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true,
        }),
    )
    .use(securityHeaders)
    .use(
        rateLimit({
            duration: 60000,
            max: 100,
        }),
    )
    // Documentation
    .use(openapi({ path: "/docs" }))

    // Services
    .get("/", () => "Hello from Limpora!, using Elysia.js!")
    .use(authController)
    .use(userController)
    .use(userEarningController)
    .use(servicesController)
    .use(reviewsController)
    .use(providerServicesController)
    .use(bookingController)
    .listen(3000);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
