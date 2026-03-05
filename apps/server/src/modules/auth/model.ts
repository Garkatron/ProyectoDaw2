import { t, type UnwrapSchema } from "elysia";
import { UserRole } from "@limpora/common/src/enums/Role.enum";

export const AuthModel = {
    verifyEmailBody: t.Object({
        code: t.String(),
        email: t.String({ format: "email", error: "Invalid email format" }),
    }),

    registerBody: t.Object({
        username: t.String(),
        password: t.String(),
        email: t.String({ format: "email", error: "Invalid email format" }),
        role: t.Enum(UserRole),
    }),

    loginBody: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
    }),

    loginResponse: t.Object({
        id: t.Number(),
        username: t.String(),
        role: t.String(),
        token: t.String(),
    }),
    registerResponse: t.Object({
        username: t.String(),
        email: t.String(),
    }),

    emailVerifiedResponse: t.Object({
        success: t.Boolean(),
    }),

    loginInvalid: t.Literal("Invalid email or password"),
    verificationCodeNotGenerated: t.Literal("Verification code not found"),
    invalidCode: t.Literal("Invalid verification code."),
    loginUserNotExists: t.Literal("User not exists"),
    emailNotVerified: t.Literal("User isn't verified email.  Sending email..."),

    registerInvalid: t.Literal("Email already in use"),
} as const;

export type AuthModel = {
    [k in keyof typeof AuthModel]: UnwrapSchema<(typeof AuthModel)[k]>;
};
