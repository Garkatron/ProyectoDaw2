import { Elysia, type Context } from 'elysia'
import { AuthService } from './service';
import { UserRole } from '@limpora/common/src/enums/Role.enum'

export const AuthGuard = new Elysia({ name: 'Auth.Guard' }).macro({
    isAuthenticated: {
        async resolve({ headers, status }: Context) {
            const authHeader = headers['authorization'];

            // ? Verify if header exists with valid format
            if (!authHeader?.startsWith('Bearer ')) {
                return status(401, 'Token required');
            }

            const token = authHeader.split(' ')[1];

            // ? Verify token with Firebase
            const decoded = await AuthService.verifyToken(token);

            // ? Inject user in all protected route context
            return {
                user: {
                    uid: decoded.uid,
                    email: decoded.email,
                    role: decoded.rle as string | undefined,
                },
            };
        },
    },
    hasRole: (role: UserRole | UserRole[]) => ({
        async resolve({ headers, status }: Context) {
            const authHeader = headers['authorization'];

            if (!authHeader?.startsWith('Bearer ')) {
                return status(401, 'Token required');
            }

            const token = authHeader.split(' ')[1];
            const decoded = await AuthService.verifyToken(token);
            const userRole = decoded.role as UserRole;

            const allowedRoles = Array.isArray(role) ? role : [role];

            if (!allowedRoles.includes(userRole)) {
                return status(403, 'Forbidden');
            }

            return {
                user: {
                    uid: decoded.uid,
                    email: decoded.email,
                    role: userRole,
                },
            };
        },
    }),
});
