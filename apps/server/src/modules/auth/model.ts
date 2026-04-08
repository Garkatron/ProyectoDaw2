import { t, type UnwrapSchema } from "elysia";
import { UserRole } from "@limpora/common/src/enums/Role.enum";


export const AuthModel = {
    verifyEmailBody: t.Object({
        code: t.String(),
        email: t.String({ format: "email" }),
    }),

    registerBody: t.Object({
        username: t.String(),
        password: t.String(),
        email: t.String({ format: "email" }),
        role: t.Enum(UserRole),
        captchaToken: t.String({ minLength: 20 }),
    }),

    loginBody: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
        captchaToken: t.String({ minLength: 20 }),
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
    failedCaptcha: t.Literal("Failed captcha"),
    emailProhibited: t.Literal(
        "Try again broh. I don't like the domain of your email.",
    ),
} as const;

export type AuthModel = {
    [k in keyof typeof AuthModel]: UnwrapSchema<(typeof AuthModel)[k]>;
};
