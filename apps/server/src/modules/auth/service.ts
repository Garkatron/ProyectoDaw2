// ? AuthService
// ! ------------------------
// * Responsible for managing sessions using Firebase.
// * Handles register, login, logout, token refresh and useful queries.

import { status, t } from "elysia";
import { AuthModel } from "./model";
import { sql } from "bun";
import { firebaseAuth } from "../../libs/firebase";
import type { DecodedIdToken, UserRecord } from "firebase-admin/auth";
import { AuthQueries } from "./queries";
import { NotificationService } from "../notification/service";
import generateVefCode from "../../utils";

export abstract class AuthService {
    static async register({
        username,
        password,
        email,
        role,
    }: AuthModel["registerBody"]): Promise<AuthModel["registerResponse"]> {
        const existing = AuthQueries.findByEmail.get({ email: email });

        if (existing) {
            throw status(
                400,
                "Email already in use" satisfies AuthModel["registerInvalid"],
            );
        }

        try {
            const firebaseUser = await firebaseAuth.createUser({
                email,
                password,
                displayName: username,
            });

            await firebaseAuth.setCustomUserClaims(firebaseUser.uid, { role });

            AuthQueries.insert.run({
                firebase_uid: firebaseUser.uid,
                name: username,
                email: email,
                role: role,
            });
        } catch (error) {
            console.error("[Register][Firebase]:");
            console.error(error);
        }

        if (process.env.EMAIL_VERIFICATION === "true") {
            const generated = await generateVefCode();
            
            AuthQueries.insertVerificationCode.run({email, hashed_code: generated.hashed_code});
            const { id } = await NotificationService.sendVerificationEmail({
                to: email,
                code: generated.code,
            });
            
        }

        return { username, email };
    }

    static async login({
        email,
        password,
    }: AuthModel["loginBody"]): Promise<AuthModel["loginResponse"]> {
        if (!email || !password) {
            throw status(400, "Email and password are required");
        }

        try {
            // Fetch Firebase Identity Toolkit
            const firebaseResponse = await fetch(
                `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        password,
                        returnSecureToken: true,
                    }),
                },
            ).then((res) => res.json());

            // Handling firebase stuff
            if (firebaseResponse.error) {
                const message = firebaseResponse.error.message;

                // Firebase log
                console.warn(`[AuthService] Firebase Auth Error: ${message}`);

                switch (message) {
                    case "EMAIL_NOT_FOUND":
                    case "INVALID_EMAIL":
                        throw status(404, "User not found");
                    case "INVALID_PASSWORD":
                        throw status(401, "Incorrect password");
                    case "USER_DISABLED":
                        throw status(403, "Account disabled");
                    case "TOO_MANY_ATTEMPTS_TRY_LATER":
                        throw status(
                            429,
                            "Too many attempts. Try again later.",
                        );
                    default:
                        throw status(500, `Auth error: ${message}`);
                }
            }

            const { localId: firebase_uid, idToken } = firebaseResponse;

            // Search local
            let userRecord = AuthQueries.findByFirebaseUid.get({
                firebase_uid,
            });

            // ! Syncronization
            if (!userRecord) {
                try {
                    const firebaseUser =
                        await firebaseAuth.getUser(firebase_uid);

                    if (!firebaseUser.email) {
                        throw status(500, "Firebase user has no email");
                    }

                    await AuthQueries.insert.run({
                        firebase_uid,
                        name: firebaseUser.displayName || email.split("@")[0],
                        email: firebaseUser.email,
                        role: firebaseUser.customClaims?.role || "client",
                    });

                    userRecord = AuthQueries.findByFirebaseUid.get({
                        firebase_uid,
                    });
                } catch (dbErr) {
                    console.error(
                        "[AuthService] Error syncing user to DB:",
                        dbErr,
                    );
                    throw status(500, "Error syncing user with database");
                }
            }

            if (!userRecord) {
                throw status(500, "Failed to retrieve user record after sync");
            }

            if (process.env.EMAIL_VERIFICATION === "true") {
                if (userRecord.email_verified == 0) {
                    
                    const generated = await generateVefCode();
                    
                    AuthQueries.insertVerificationCode.run({email: userRecord.email, hashed_code: generated.hashed_code});
                    
                    await NotificationService.sendVerificationEmail({
                        to: email,
                        code: generated.code,
                    });
                    throw status(403, "User isn't verified email.  Sending email..." satisfies AuthModel["emailNotVerified"]);
                } 
            }

            return {
                id: userRecord.id,
                username: userRecord.name,
                role: userRecord.role,
                token: idToken,
            };
        } catch (err: any) {
            if (err.code && err.response) {
                throw err;
            }

            // Si es un error de red o inesperado
            console.error("[AuthService][login] Unexpected System Error:", err);
            throw status(500, "Internal Server Connection Error");
        }
    }
    static async verifyToken(token: string): Promise<DecodedIdToken> {
        try {
            return await firebaseAuth.verifyIdToken(token);
        } catch {
            throw status(401, "Invalid or expired token");
        }
    }

    static async getFirebaseUser(uid: string) {
        try {
            return await firebaseAuth.getUser(uid);
        } catch {
            throw status(404, "User not found in Firebase");
        }
    }

    static async getFirebaseUserByEmail(email: string) {
        try {
            return await firebaseAuth.getUserByEmail(email);
        } catch {
            throw status(404, "User not found in Firebase");
        }
    }

    static async revokeTokens(uid: string): Promise<void> {
        await firebaseAuth.revokeRefreshTokens(uid);
    }

    static async verifyEmailCode({ email, code: sent_code }: AuthModel["verifyEmailBody"]): Promise<AuthModel["emailVerifiedResponse"]> {

        const r = AuthQueries.findVerificationCodeByEmail.get({email});

        if (!r) throw status(404, "Verification code not found" satisfies AuthModel["verificationCodeNotGenerated"]);

        const isValid = await Bun.password.verify(sent_code, r.code);
        if (!isValid) throw status(401, "Invalid verification code." satisfies AuthModel["invalidCode"]);

        AuthQueries.markCodeAsUsed.run({ id: r.id });
        const { lastInsertRowid } = AuthQueries.updateEmailVerified.run({ email });

        return {
            success:!!lastInsertRowid
        }
    }
}
