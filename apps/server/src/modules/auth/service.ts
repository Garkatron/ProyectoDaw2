// ? AuthService
// ! ------------------------
// * Responsible for managing sessions using Firebase.
// * Handles register, login, logout, token refresh and useful queries.

import { resolveMx } from "dns/promises";
import { status, t } from "elysia";
import { AuthModel } from "./model";
import { sql } from "bun";
import { firebaseAuth } from "../../libs/firebase";
import type { DecodedIdToken, UserRecord } from "firebase-admin/auth";
import { AuthQueries } from "./queries";
import { NotificationService } from "../notification/service";
import generateVefCode from "../../utils";
import { logger } from "../../libs/pino";
import redis from "../../libs/redis";
import { UserRole } from "@limpora/common";

const prohibited = [
    /@example\./i,
    /@test\.com$/i,
    /@test\.org$/i,
    /@test\.net$/i,
    /@test\.xyz$/i,
    /@mailinator\.com$/i,
    /@yopmail\.com$/i,
    /@guerrillamail\./i,
    /@tempmail\./i,
    /@throwam\.com$/i,
    /@sharklasers\.com$/i,
    /@guerrillamailblock\.com$/i,
    /@grr\.la$/i,
    /@spam4\.me$/i,
    /@trashmail\./i,
    /@dispostable\.com$/i,
    /@maildrop\.cc$/i,
    /@fakeinbox\.com$/i,
    /@mytemp\.email$/i,
    /@temp-mail\.org$/i,
    /@10minutemail\./i,
    /@minutemail\./i,
    /@discard\.email$/i,
    /@spamgourmet\.com$/i,
    /@spamgourmet\.net$/i,
    /@spamgourmet\.org$/i,
    /@burnthespam\.info$/i,
    /@deadaddress\.com$/i,
    /@spamhole\.com$/i,
    /@spamoff\.de$/i,
    /@wegwerfmail\./i,
    /@mohmal\.com$/i,
    /@getnada\.com$/i,
    /@nada\.email$/i,
    /@filzmail\.com$/i,
    /@owlpic\.com$/i,
    /@tempinbox\./i,
    /@throwaway\.email$/i,
    /@throwam\.com$/i,
    /@emailondeck\.com$/i,
    /@mailnesia\.com$/i,
    /@mailnull\.com$/i,
    /@spamgourmet\.com$/i,
    /@jetable\./i,
    /@jetable\.fr\.nf$/i,
    /@nomail\.xl\.cx$/i,
    /@yolo\.im$/i,
    /@cool\.fr\.nf$/i,
    /@courriel\.fr\.nf$/i,
    /@spam4\.me$/i,
    /@grr\.la$/i,
    /@guerrillamail\.biz$/i,
    /@guerrillamail\.de$/i,
    /@guerrillamail\.net$/i,
    /@guerrillamail\.org$/i,
    /@guerrillamail\.info$/i,
    /@spam4\.me$/i,
    /@10mail\.org$/i,
    /@10minut\.com\.pl$/i,
    /@10minutenemail\.de$/i,
    /@spamhereplease\.com$/i,
    /@mailscrap\.com$/i,
    /@spammotel\.com$/i,
    /@incognitomail\.org$/i,
    /@mailexpire\.com$/i,
    /@spamfree24\.org$/i,
    /@spamfree24\.de$/i,
    /@spamfree24\.eu$/i,
    /@objectmail\.com$/i,
    /@obobbo\.com$/i,
    /@proxymail\.eu$/i,
    /@rcpt\.at$/i,
    /@ruu\.vi$/i,
    /@safe-mail\.net$/i,
    /@smellfear\.com$/i,
    /@snkmail\.com$/i,
    /@sofimail\.com$/i,
    /@soodonims\.com$/i,
    /@spamday\.com$/i,
];

export abstract class AuthService {
    static async verifyTurnstile(
        token: string,
        ip?: string,
    ): Promise<{
        success: boolean;
        challenge_ts?: string;
        hostname?: string;
        "error-codes"?: string[];
    }> {
        const res = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                body: new URLSearchParams({
                    secret: process.env.TURNSTILE_SECRET_KEY!,
                    response: token,
                    remoteip: ip ?? "",
                }),
            },
        );

        return res.json();
    }

    static async register(
        {
            username,
            password,
            email,
            role,
            captchaToken,
        }: AuthModel["registerBody"],
        ip: string,
    ): Promise<AuthModel["registerResponse"]> {
        logger.info({ email, role }, "register attempt");
        if (role === UserRole.Admin) throw status(400, "You can't be an admin");

        const mx = await resolveMx(email.split("@")[1]).catch(() => []);
        if (mx.length === 0) throw status(400, "Invalid email domain");

        if (prohibited.some((r) => r.test(email))) {
            throw status(
                400,
                "Try again broh. I don't like the domain of your email.",
            );
        }

        // ! CAPTCHA START

        await AuthService.rateLimitIP(ip);
        await AuthService.rateLimitEmail(email);
        await AuthService.rateLimitIPEmail(ip, email);

        await AuthService.validateCaptcha({
            token: captchaToken,
            ip,
        });

        // ! CAPTCHA END

        const existing = AuthQueries.findByEmail.get({ email: email });

        if (existing) {
            logger.warn({ email }, "register failed: email already in use");

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
            logger.info(
                { email, uid: firebaseUser.uid },
                "firebase user created",
            );
        } catch (error) {
            logger.error({ email, error }, "register failed: firebase error");
            console.error(error);
            throw status(500, "Error creating user");
        }

        if (process.env.EMAIL_VERIFICATION === "true") {
            const generated = await generateVefCode();

            AuthQueries.insertVerificationCode.run({
                email,
                hashed_code: generated.hashed_code,
            });
            const { id } = await NotificationService.sendVerificationEmail({
                to: email,
                code: generated.code,
            });
            logger.info(
                { email, notificationId: id },
                "verification email sent",
            );
        }

        return { username, email };
    }

    static async login(
        { email, password, captchaToken }: AuthModel["loginBody"],
        ip: string,
    ): Promise<AuthModel["loginResponse"]> {
        logger.info({ email }, "login attempt");

        const mx = await resolveMx(email.split("@")[1]).catch(() => []);
        if (mx.length === 0) throw status(400, "Invalid email domain");

        if (prohibited.some((r) => r.test(email))) {
            throw status(
                400,
                "Try again broh. I don't like the domain of your email.",
            );
        }

        if (!email || !password) {
            logger.error(
                { email },
                "login failed: email and password are required",
            );
            throw status(400, "Email and password are required");
        }

        // ! CAPTCHA START

        await AuthService.rateLimitIP(ip);
        await AuthService.rateLimitEmail(email);
        await AuthService.rateLimitIPEmail(ip, email);

        await AuthService.validateCaptcha({
            token: captchaToken,
            ip,
        });

        // ! CAPTCHA END

        try {
            logger.info({ email }, "fetching firebase user");

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
                logger.error(
                    { error: firebaseResponse.error, message },
                    "firebase error: login failed",
                );

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
            logger.info({ email }, "user found.");

            // ! Syncronization
            if (!userRecord) {
                logger.info({ email }, "synchronizing user");

                try {
                    const firebaseUser =
                        await firebaseAuth.getUser(firebase_uid);

                    if (!firebaseUser.email) {
                        logger.error(
                            {},
                            "login failed: firebase user has no email",
                        );
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
                    logger.error({ dbErr }, "login failed: firebase error");
                    throw status(500, "Error syncing user with database");
                }
            }

            if (!userRecord) {
                logger.error(
                    {},
                    "login failed: Failed to retrieve user record after sync",
                );
                throw status(500, "Failed to retrieve user record after sync");
            }

            if (process.env.EMAIL_VERIFICATION === "true") {
                logger.info(
                    {},
                    "login: email verification is enabled, continuing to verification",
                );
                if (userRecord.email_verified == 0) {
                    const generated = await generateVefCode();

                    AuthQueries.insertVerificationCode.run({
                        email: userRecord.email,
                        hashed_code: generated.hashed_code,
                    });

                    await NotificationService.sendVerificationEmail({
                        to: email,
                        code: generated.code,
                    });

                    logger.warn({}, "login failed: user not verified");

                    throw status(
                        403,
                        "User isn't verified email.  Sending email..." satisfies AuthModel["emailNotVerified"],
                    );
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
                logger.error({ err }, "login failed: unknown error");
                throw err;
            }

            logger.error({ err }, "login failed: unknown error");
            console.error("[AuthService][login] Unexpected System Error:", err);
            throw status(500, "Internal Server Connection Error");
        }
    }
    static async rateLimitIP(ip: string, limit = 50, window = 60) {
        const key = `rl:ip:${ip}`;

        const count = await redis.incr(key);

        if (count === 1) {
            await redis.expire(key, window);
        }

        if (count > limit) {
            throw status(429, "Tryi again later... (IP)");
        }
    }
    static async rateLimitEmail(email: string, limit = 15, window = 120) {
        const key = `rl:email:${email}`;

        const count = await redis.incr(key);

        if (count === 1) {
            await redis.expire(key, window);
        }

        if (count > limit) {
            throw status(429, "Try again later... (email)");
        }
    }

    static async rateLimitIPEmail(
        ip: string,
        email: string,
        limit = 20,
        window = 60,
    ) {
        const key = `rl:ip_email:${ip}:${email}`;

        const count = await redis.incr(key);

        if (count === 1) {
            await redis.expire(key, window);
        }

        if (count > limit) {
            throw status(429, "Try again later.");
        }
    }

    static async validateCaptcha({
        token,
        ip,
    }: {
        token: string;
        ip?: string;
    }) {
        const key = `captcha:${token}`;

        const lock = await redis.set(key, "1", {
            NX: true,
            EX: 300,
        });

        if (lock === null) {
            throw status(400, "Captcha already used");
        }

        const captcha = await AuthService.verifyTurnstile(token, ip);

        if (captcha.hostname !== "www.limpora.xyz") {
            await redis.del(key);
            throw status(400, "Invalid captcha origin");
        }

        if (!captcha.success) {
            await redis.del(key);
            throw status(400, "Failed captcha");
        }

        return true;
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

    static async verifyEmailCode({
        email,
        code: sent_code,
    }: AuthModel["verifyEmailBody"]): Promise<
        AuthModel["emailVerifiedResponse"]
    > {
        logger.info({ email, sent_code }, "email verification attempt");

        const r = AuthQueries.findVerificationCodeByEmail.get({ email });

        if (!r) {
            logger.error(
                { email },
                "email verification failed: Verification code not found",
            );

            throw status(
                404,
                "Verification code not found" satisfies AuthModel["verificationCodeNotGenerated"],
            );
        }

        const isValid = await Bun.password.verify(sent_code, r.code);
        if (!isValid) {
            logger.error(
                { email, sent_code },
                "email verification failed: invalid verification code",
            );

            throw status(
                401,
                "Invalid verification code." satisfies AuthModel["invalidCode"],
            );
        }
        AuthQueries.markCodeAsUsed.run({ id: r.id });
        const { lastInsertRowid } = AuthQueries.updateEmailVerified.run({
            email,
        });

        logger.info({ email }, "email verification succed");

        return {
            success: !!lastInsertRowid,
        };
    }
    static async getMe(uid: string)  {
        const dbUser = AuthQueries.findByFirebaseUid.get({
            firebase_uid: uid,
        });

        if (!dbUser) {
            throw new Error("User not found in local database");
        }

        return {
            id: dbUser.id,
            name: dbUser.name,
            role: dbUser.role,
            email_verified: dbUser.email_verified,
            total_points: dbUser.total_points,
            member_since: dbUser.member_since,
            email: dbUser.email,
        };
    }
}
