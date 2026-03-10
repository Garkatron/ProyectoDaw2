import Elysia from "elysia";
import { OAuthService } from "./service";

// https://console.cloud.google.com/apis/credentials?pli=1
export const oauthController = new Elysia({ prefix: "/google" })
    .get("/callback", ({ query, cookie, redirect }) =>
        OAuthService.callback({ code: query.code, cookie, redirect }),
    )
    .get("redirect", async ({ redirect }) =>
        OAuthService.redirectToGoogle(redirect),
    );
