import { t, type UnwrapSchema } from 'elysia';
import { UserRole } from '../../enums/Role.enum';

const UserObject = t.Object({
    id:           t.Number(),
    name:         t.String(),
    role:         t.Enum(UserRole),
    total_points: t.Number(),
    member_since: t.String(),
});

export const UserModel = {
    userIdParam:   t.Object({ id: t.String() }),
    userNameParam: t.Object({ name: t.String() }),

    getAllUsers:  t.Array(UserObject),
    getUserById:  UserObject,
    getUserByName: UserObject,

    notFound: t.Literal('User not found'),
} as const

export type UserModel = {
    [k in keyof typeof UserModel]: UnwrapSchema<(typeof UserModel)[k]>;
};