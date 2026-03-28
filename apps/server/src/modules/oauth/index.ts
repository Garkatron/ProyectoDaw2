import Elysia from "elysia";
import { OAuthService } from "./service";

// https://console.cloud.google.com/apis/credentials?pli=1
export const oauthController = new Elysia({ prefix: "/google" })
    .get("/callback", async (ctx) => OAuthService.callback(ctx))
    .get("/redirect", async ({ redirect }) =>
        OAuthService.redirectToGoogle(redirect)
    );
