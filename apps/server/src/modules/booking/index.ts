import { Elysia } from "elysia";
import { AuthGuard } from "../auth/guard";
import { UserRole } from "@limpora/common/src/enums/Role.enum";
import { BookingService } from "./service";
import { BookingModel } from "./model";

export const bookingController = new Elysia({ prefix: "/booking" })
    .use(AuthGuard)
    .post("/", async ({ body }) => BookingService.assign(body), {
        body: BookingModel.assignBody,
        response: {
            403: BookingModel.forbidden,
            404: BookingModel.notFound,
            409: BookingModel.dateOccupied,
        },
        hasRole: [UserRole.Admin],
    })
    .post(
        "/me",
        async ({ user, body }) => BookingService.assignByUid(body, user.uid),
        {
            body: BookingModel.assignMeBody,
            response: {
                403: BookingModel.forbidden,
                404: BookingModel.notFound,
                409: BookingModel.dateOccupied,
            },
            isAuthenticated: true,
        },
    )
    .get("/me", async ({ user }) => BookingService.getMe(user.uid), {
        response: {
            404: BookingModel.notFound,
            403: BookingModel.forbidden,
        },
        isAuthenticated: true,
    })

    .put("/status", async ({ body }) => BookingService.updateStatus(body), {
        body: BookingModel.updateStatusBody,
        response: {
            404: BookingModel.notFound,
        },
        hasRole: [UserRole.Admin, UserRole.Provider],
    })
    .get(
        "/provider/:provider_id",
        async ({ params }) => BookingService.getByProviderId(params),
        {
            params: BookingModel["providerIdParam"],
            response: {
                404: BookingModel.notFound,
                403: BookingModel.forbidden,
            },
            hasRole: [UserRole.Admin],
        },
    )
    .get(
        "/client/:client_id",
        async ({ params }) => BookingService.getByClientId(params),
        {
            params: BookingModel["clientIdParam"],
            response: {
                404: BookingModel.notFound,
                403: BookingModel.forbidden,
            },
            hasRole: [UserRole.Admin],
        },
    );
