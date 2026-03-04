// ? UserService
// ! ------------------------
// * Responsible for tracking and managing user earning data.

import { status } from 'elysia';
import { EarningModel } from './model';
import { EarningsQueries } from './queries';
import { UserQueries } from '../user/queries';

export abstract class EarningService {
    static async getStats({
        provider_id,
    }: EarningModel['getUserEarningsParams']): Promise<EarningModel['getUserEarnings']> {
        const user = UserQueries.findById.get({ id: Number(provider_id) });
        if (!user) throw status(404, 'User not found' satisfies EarningModel['notFound']);

        const stats = EarningsQueries.findProviderStats.get({ provider_id: Number(provider_id) });
        if (!stats) throw status(404, 'User not found' satisfies EarningModel['notFound']);

        return {
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
            },
            earnings: {
                closed_appointments: stats.closed_appointments,
                cancelled_appointments: stats.cancelled_appointments,
                total_money: stats.total_money,
                retained_money: stats.retained_money,
            },
        };
    }
}
