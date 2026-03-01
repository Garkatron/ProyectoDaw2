import { t, type UnwrapSchema } from 'elysia';
import { UserRole } from '@limpora/common/enums/Role.enum'

export const EarningModel = {
    getUserEarningsParams: t.Object({
        provider_id: t.String(),
    }),
    getUserEarnings: t.Object({
        user: t.Object({
            id: t.Number(),
            name: t.String(),
            role: t.Enum(UserRole),
        }),
        earnings: t.Object({
            closed_appointments: t.Number(),
            cancelled_appointments: t.Number(),
            total_money: t.Number(),
            retained_money: t.Number(),
        }),
    }),
    notFound: t.Literal('User not found'),
} as const;

export type EarningModel = {
    [k in keyof typeof EarningModel]: UnwrapSchema<(typeof EarningModel)[k]>;
};
