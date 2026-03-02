import { status } from "elysia";
import type { AuthModel } from "./model";
import { sql } from "bun";
import { firebaseAuth } from "../../libs/firebase";
import type { DecodedIdToken } from "firebase-admin/auth";
import { AuthQueries } from "./queries";

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
                username: username,
                email: email,
                role: role,
            });
        } catch (error) {
            console.error("[Register][Firebase]:");
            console.error(error);
        }

        return { username, email };
    }

    static async login({
        email,
        password,
    }: AuthModel["loginBody"]): Promise<AuthModel["loginResponse"]> {
        const existing = AuthQueries.findByEmail.get({ email: email });

        if (!existing) {
            throw status(
                400,
                "User not exists" satisfies AuthModel["loginUserNotExists"],
            );
        }

        const firebaseToken = await firebaseAuth.createCustomToken(
            existing.name,
            {
                email: existing!.email,
                role: existing!.role,
            },
        );

        return {
            username: existing.name,
            token: firebaseToken,
        };
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

    static async revokeTokens(uid: string): Promise<void> {
        await firebaseAuth.revokeRefreshTokens(uid);
    }
}
