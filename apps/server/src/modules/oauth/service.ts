import { google } from "googleapis";
import { OAuthClient, SCOPES } from "../../libs/googleapis";
import { status, type Context } from "elysia";
import { AuthService } from "../auth/service";
import { UserService } from "../user/service";
import { UserRole } from "@limpora/common/*";
import { firebaseAuth } from "../../libs/firebase";
import { AuthQueries } from "../auth/queries";
import { fail } from "../../utils";
import { logger } from "../../libs/pino";

export abstract class OAuthService {
    static async callback({
        query,
        cookie,
        redirect,
    }: {
        query: { code?: string; error?: string };
        cookie: Context["cookie"];
        redirect: Context["redirect"];
    }) {
        logger.info("google callback attempt");
        try {
            if (query.error) {
                logger.error({ error: query.error }, "google OAuth error");
                return redirect(`${process.env.FRONTEND_URL}/login`);
            }

            const code = query.code;
            if (!code) {
                logger.error({ error: query.error }, "missing OAuth code");
                return redirect(`${process.env.FRONTEND_URL}/login`);
            }

            const { tokens } = await OAuthClient.getToken(code);
            OAuthClient.setCredentials(tokens);

            const oauth2 = google.oauth2({
                auth: OAuthClient,
                version: "v2",
            });

            const { data } = await oauth2.userinfo.get();
            const { email, name } = data;
            if (!email) {
                throw fail(400, "No email from Google");
            }

            if (!email) throw fail(400, "No email from Google");

            let firebaseUser;
            try {
                firebaseUser = await AuthService.getFirebaseUserByEmail(email);
                logger.info(
                    { firebase_user_id: firebaseUser.uid },
                    "found firebase user",
                );
            } catch {
                logger.info("not found firebase user");
                try {
                    await AuthService.register({
                        username: name || email.split("@")[0],
                        email,
                        password: crypto.randomUUID(),
                        role: UserRole.Client,
                    });
                } catch (regErr) {
                    console.error("[OAuth] Register failed:", regErr);
                }
                firebaseUser = await AuthService.getFirebaseUserByEmail(email);
            }

            console.log(
                "[OAuth] Getting userRecord for uid:",
                firebaseUser.uid,
            );

            let userRecord;
            try {
                userRecord = await UserService.getMe({ uid: firebaseUser.uid });
            } catch {
                logger.info({ error: query.error }, "user not in db, syncing...");
                AuthQueries.insert.run({
                    firebase_uid: firebaseUser.uid,
                    name: firebaseUser.displayName || email.split("@")[0],
                    email: firebaseUser.email!,
                    role: firebaseUser.customClaims?.role || UserRole.Client,
                });
                userRecord = await UserService.getMe({ uid: firebaseUser.uid });
            }

            const role =
                userRecord?.role ||
                firebaseUser.customClaims?.role ||
                UserRole.Client;

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

            return redirect(
                `${process.env.FRONTEND_URL}/auth/callback?token=${tokenData.idToken}`,
            );
        } catch (err) {
            logger.error({ error: err }, "google callback failed");
            return redirect(`${process.env.FRONTEND_URL}/login`);
        }
    }

    static getGoogleUrl(): string {
        return OAuthClient.generateAuthUrl({
            access_type: "offline",
            scope: SCOPES,
            prompt: "consent",
            include_granted_scopes: true,
            response_type: "code",
        });
    }

    static redirectToGoogle(redirect: Context["redirect"]) {
        return redirect(OAuthService.getGoogleUrl(), 302);
    }
}
