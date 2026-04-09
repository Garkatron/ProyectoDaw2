import { Elysia } from "elysia";
import { AuthService } from "./service";
import { AuthModel } from "./model";
import { AuthGuard } from "./guard";
import { rateLimit } from "elysia-rate-limit";

const authPublic = new Elysia({ prefix: "/auth" })
    .use(rateLimit({ duration: 60000, max: 200 }))

    .post("/verify", ({ body }) => AuthService.verifyEmailCode(body), {
        body: AuthModel["verifyEmailBody"],
        response: {
            404: AuthModel.verificationCodeNotGenerated,
            401: AuthModel.invalidCode,
        },
    })

    .post(
        "/register",
        async ({ body, request }) => {
            const ip = getIP(request);

            return AuthService.register(
                {
                    ...body,
                },
                ip,
            );
        },
        {
            body: AuthModel.registerBody,
            response: {
                200: AuthModel.registerResponse,
                400: AuthModel.registerInvalid,
            },
        },
    )

    .post(
        "/login",
        async ({ body, cookie: { session }, request }) => {
            const ip = getIP(request);

            const response = await AuthService.login(
                {
                    ...body,
                },
                ip,
            );

            session.value = response.token;
            return response;
        },
        {
            body: AuthModel.loginBody,
            response: {
                400: AuthModel.loginInvalid,
                401: AuthModel.loginInvalid,
                403: AuthModel.emailNotVerified,
                404: AuthModel.loginUserNotExists,
                500: AuthModel.registerInvalid,
            },
        },
    );

const authPrivate = new Elysia({ prefix: "/auth" })
    .use(AuthGuard)

    .post(
        "/logout",
        async ({ user, cookie: { session } }) => {
            await AuthService.revokeTokens(user.uid);
            session.value = undefined;
            return { success: true };
        },
        { isAuthenticated: true },
    )

    .get("/me", async ({ user }) => AuthService.getMe(user.uid), {
        isAuthenticated: true,
    });

export const authController = new Elysia().use(authPublic).use(authPrivate);

function getIP(request: Request): string {
    return (
        request.headers.get("cf-connecting-ip") ||
        request.headers.get("x-forwarded-for")?.split(",")[0] ||
        request.headers.get("x-real-ip") ||
        "unknown"
    );
}
