import { google } from "googleapis";
import { OAuthClient, SCOPES } from "../../libs/googleapis";
import { status, type Context } from "elysia";
import { AuthService } from "../auth/service";
import { UserService } from "../user/service";
import { AuthQueries } from "../auth/queries";
import { UserRole } from "@limpora/common/*";
import { firebaseAuth } from "../../libs/firebase";

export abstract class OAuthService {
    static async callback({
        code,
        cookie,
        redirect,
    }: {
        code: string;
        cookie: Context["cookie"];
        redirect: Context["redirect"];
    }) {
        try {
            const { tokens } = await OAuthClient.getToken(code);
            OAuthClient.setCredentials(tokens);

            const oauth2 = google.oauth2({ auth: OAuthClient, version: "v2" });
            const { data } = await oauth2.userinfo.get();
            const { email, name } = data;

            const firebaseUser = await AuthService.getFirebaseUserByEmail(
                email!,
            );

            let userRecord = await UserService.getMe({ uid: firebaseUser.uid });
            if (!userRecord) {
                throw status(404, "Not Found");
            }

            const role = userRecord?.role || firebaseUser.customClaims?.role || UserRole.Client;

            const customToken = await firebaseAuth.createCustomToken(
                firebaseUser.uid,
                { role },
            );

            const tokenRes = await fetch(
                `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.FIREBASE_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        token: customToken,
                        returnSecureToken: true,
                    }),
                },
            );
            const tokenData = await tokenRes.json();

            const sessionCookie = await firebaseAuth.createSessionCookie(
                tokenData.idToken,
                {
                    expiresIn: 60 * 60 * 24 * 5 * 1000,
                },
            );

            cookie.session.set({
                value: sessionCookie,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 60 * 60 * 24 * 5,
            });

            return redirect(`${process.env.FRONTEND_URL}/me`);
        } catch (err) {
            console.error(err);
            return redirect(`${process.env.FRONTEND_URL}/login`);
        }
    }

    static getGoogleUrl(): string {
        return OAuthClient.generateAuthUrl({
            access_type: "offline",
            scope: SCOPES,
            prompt: "consent",
        });
    }

    static redirectToGoogle(redirect: Context["redirect"]) {
        return redirect(OAuthService.getGoogleUrl(), 308);
    }
}
