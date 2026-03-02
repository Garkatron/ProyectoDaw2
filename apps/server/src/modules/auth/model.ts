import { t, type UnwrapSchema } from 'elysia';
import { UserRole } from '@limpora/common/src/enums/Role.enum'

export const AuthModel = {
    registerBody: t.Object({
        username: t.String(),
        password: t.String(),
        email: t.String({ format: 'email', error: 'Invalid email format' }),
        role: t.Enum(UserRole),
    }),

    loginBody: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String(),
    }),

    loginResponse: t.Object({
        username: t.String(),
        token: t.String(),
    }),
    registerResponse: t.Object({
        username: t.String(),
        email: t.String(),
    }),
    
    loginInvalid: t.Literal('Invalid email or password'),
    loginUserNotExists: t.Literal('User not exists'),
    
    registerInvalid: t.Literal('Email already in use'),
} as const;

export type AuthModel = {
    [k in keyof typeof AuthModel]: UnwrapSchema<(typeof AuthModel)[k]>;
};
