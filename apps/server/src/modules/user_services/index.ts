import { Elysia } from "elysia";
import { AuthGuard } from "../auth/guard";
import { UserRole } from "@limpora/common";
import { ProviderServicesService } from "./service";
import { ProviderServicesModel } from "./model";
import { UserService } from "../user/service";
import { AuthQueries } from "../auth/queries";

export const providerServicesController = new Elysia({ prefix: "/providers" })
    .use(AuthGuard)

    .get("/", async () => ProviderServicesService.getAll(), {
        response: { 200: ProviderServicesModel.getAllResponse },
        hasRole: UserRole.Admin,
    })

    .get(
        "/:provider_id/services",
        async ({ params }) => ProviderServicesService.getByProviderId(params),
        {
            params: ProviderServicesModel.providerIdParam,
            response: { 200: ProviderServicesModel.getAllResponse },
            isAuthenticated: true,
        },
    )

    .post(
        "/me/services/assign",
        async ({ body, user }) =>
            ProviderServicesService.assignByUid(body, user.uid),
        {
            body: ProviderServicesModel.assignServiceBody,
            hasRole: UserRole.Provider,
        },
    )

    .delete(
        "/me/services/:service_id/unassign",
        async ({ params, user }) =>
            ProviderServicesService.unassignByUid(params, user.uid),
        {
            params: ProviderServicesModel.serviceIdParam,
            hasRole: UserRole.Provider,
        },
    )

    .patch(
        "/me/services/:service_id/price",
        ({ body, params, user }) =>
            ProviderServicesService.updatePriceByUid(
                user.uid,
                Number(params.service_id),
                body,
            ),
        {
            params: ProviderServicesModel.serviceIdParam,
            body: ProviderServicesModel.updatePriceBody,
            hasRole: UserRole.Provider,
        },
    )
    .patch(
        "/me/services/:service_id/status",
        ({ body, params, user }) =>
            ProviderServicesService.toggleActiveByUid(
                user.uid,
                Number(params.service_id),
                body,
            ),
        {
            params: ProviderServicesModel.serviceIdParam,
            body: ProviderServicesModel.toggleActiveBody,
            hasRole: UserRole.Provider,
        },
    )

    .patch(
        "/:provider_id/services/:service_id/price",
        async ({ body, params }) =>
            ProviderServicesService.updatePrice(body, params),
        {
            params: ProviderServicesModel.providerAndServiceIdParam,
            body: ProviderServicesModel.updatePriceBody,
            hasRole: UserRole.Admin,
        },
    )

    .delete(
        "/:provider_id/services/:service_id/unassign",
        async ({ params }) => ProviderServicesService.unassign(params),
        {
            params: ProviderServicesModel.providerAndServiceIdParam,
            hasRole: UserRole.Admin,
        },
    );
