import { Elysia } from "elysia";
import { AuthService } from "./service";
import { AuthModel } from "./model";
import { AuthGuard } from "./guard";
export const authController = new Elysia({ prefix: "/auth" })

    .post("/register", async ({ body }) => AuthService.register(body), {
        body: AuthModel.registerBody,
        response: {
            200: AuthModel.registerResponse,
            400: AuthModel.registerInvalid,
        },
    })

    .post(
        "/login",
        async ({ body, cookie: { session } }) => {
            const response = await AuthService.login(body);
            session.value = response.token;
            return response;
        },
        {
            body: AuthModel.loginBody,
            response: {
                400: AuthModel.loginInvalid,
                401: AuthModel.loginInvalid,
                403: AuthModel.loginInvalid,
                404: AuthModel.loginUserNotExists,
                500: AuthModel.registerInvalid,
            },
        },
    )

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

    .get("/me", async ({ user }) => AuthService.getFirebaseUser(user.uid), {
        isAuthenticated: true,
    });
