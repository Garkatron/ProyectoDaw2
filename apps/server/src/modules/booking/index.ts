import { Elysia, t } from "elysia";
import { AuthGuard } from "../auth/guard";
import { UserRole } from "@limpora/common";
import { BookingService } from "./service";
import { BookingModel } from "./model";

export const bookingController = new Elysia({ prefix: "/bookings" })
    .use(AuthGuard)

    .group("/me", (app) =>
        app
            .post(
                "/",
                ({ user, body }) => BookingService.assignByUid(body, user.uid),
                {
                    body: BookingModel.assignMeBody,
                    response: {
                        201: BookingModel.assignResponse,
                        403: BookingModel.forbidden,
                        404: BookingModel.notFound,
                        409: BookingModel.dateOccupied,
                    },
                    isAuthenticated: true,
                },
            )

            .get("/", ({ user }) => BookingService.getMe(user.uid), {
                response: {
                    200: BookingModel.listResponse,
                    404: BookingModel.notFound,
                },
                isAuthenticated: true,
            })

            // Status

            .patch(
                "/:id/status",
                ({ user, params, body }) =>
                    BookingService.updateStatusMe(body, params, user.uid),
                {
                    params: t.Object({ id: t.Numeric() }),
                    body: BookingModel.updateStatusBody,
                    response: {
                        200: BookingModel.updateResponse,
                        403: BookingModel.forbidden,
                        404: BookingModel.notFound,
                    },
                    isAuthenticated: true,
                },
            ),
    )

    .get(
        "/provider/:provider_id/availability",
        ({ params, query }) => BookingService.getAvailability(params, query),
        {
            params: BookingModel.providerIdParam,
            query: BookingModel.availabilityQuery,
            response: {
                200: BookingModel.availabilityResponse,
                404: BookingModel.notFound,
            },
            isAuthenticated: true,
        },
    )

    // * Admin

    /*
    .get("/", () => BookingService.getAll(), {
        response: { 200: BookingModel.listResponse },
        hasRole: [UserRole.Admin],
    })*/

    .post("/", ({ body }) => BookingService.assign(body), {
        body: BookingModel.assignBody,
        response: {
            201: BookingModel.assignResponse,
            403: BookingModel.forbidden,
            409: BookingModel.dateOccupied,
        },
        hasRole: [UserRole.Admin],
    })

    .get(
        "/provider/:provider_id",
        ({ params }) => BookingService.getByProviderId(params),
        {
            params: BookingModel.providerIdParam,
            response: { 200: BookingModel.getByProviderResponse },
            hasRole: [UserRole.Admin],
        },
    )

    .get(
        "/client/:client_id",
        ({ params }) => BookingService.getByClientId(params),
        {
            params: BookingModel.clientIdParam,
            response: { 200: BookingModel.listResponse },
            hasRole: [UserRole.Admin],
        },
    );
