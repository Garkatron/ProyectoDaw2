import { OAuthClient, SCOPES } from "../../libs/googleapis";
import type { Context } from "elysia";

export abstract class OAuthService {
    static async callback() {}

    static getGoogleUrl(): string {
        return OAuthClient.generateAuthUrl({
            access_type: "offline", // permite refresh token
            scope: SCOPES,
            prompt: "consent", // fuerza que pida permisos siempre
        });
    }

    static redirectToGoogle(redirect: Context["redirect"]) {
        return redirect(OAuthService.getGoogleUrl(), 308);
    }
}
