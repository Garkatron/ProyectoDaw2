import Elysia from "elysia";
import { AuthGuard } from "../auth/guard";
import { CurrencyModel } from "./model";
import { CurrencyService } from "./service";
import { UserRole } from "@limpora/common/*";

export const userCurrencyController = new Elysia({ prefix: "/currency" })
    .use(AuthGuard)

    .get("/me", async ({ user }) => CurrencyService.getEarningsMe(user.uid), {
                 response: {
                200: CurrencyModel.getUserEarnings,
                404: CurrencyModel.notFound,
            },
            isAuthenticated: true
    })

    .get(
        "/:provider_id",
        async ({ params }) => CurrencyService.getStats(params),
        {
            response: {
                200: CurrencyModel.getUserEarnings,
                404: CurrencyModel.notFound,
            },
            hasRole: UserRole.Admin,
        },
    );
