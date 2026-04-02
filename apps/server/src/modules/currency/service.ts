// ? UserService
// ! ------------------------
// * Responsible for tracking and managing user earning data.

import { status } from "elysia";
import { CurrencyModel } from "./model";
import { CurrencyQueries } from "./queries";
import { UserQueries } from "../user/queries";
import { UserService } from "../user/service";
import { fail } from "../../utils";
import { logger } from "../../libs/pino";

export abstract class CurrencyService {
    static async getStats({
        provider_id,
    }: CurrencyModel["getUserEarningsParams"]): Promise<
        CurrencyModel["getUserEarnings"]
    > {
        logger.info(
            { provider_id },
            "get stats attempt",
        );

        const user = UserQueries.findById.get({ id: Number(provider_id) });
        if (!user)
            throw fail(
                404,
                "User not found" satisfies CurrencyModel["notFound"],
            );

        const stats = CurrencyQueries.findProviderStats.get({
            provider_id: Number(provider_id),
        });
        if (!stats)
            throw fail(
                404,
                "User not found" satisfies CurrencyModel["notFound"],
            );

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

    static async getEarningsMe(
        uid: string,
    ): Promise<CurrencyModel["getUserEarnings"]> {
        const user = await UserService.getMe({ uid });

        return CurrencyService.getStats({ provider_id: String(user.id) });
    }
}
