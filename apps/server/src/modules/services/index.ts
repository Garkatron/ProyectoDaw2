import Elysia from "elysia";
import { ServicesModel } from "./model";
import { ServicesService } from "./service";
import { AuthGuard } from "../auth/guard";
import { UserRole } from "@limpora/common/src/enums/Role.enum";
import { rateLimit } from "elysia-rate-limit";

export const servicesController = new Elysia({ prefix: "/services" })
    .use(
        rateLimit({
            duration: 60000,
            max: 60,
            errorResponse: "Too many request, try later...",
        }),
    )
    .use(AuthGuard)

    .post("/", async ({ body }) => ServicesService.create(body), {
        body: ServicesModel.createBody,
        response: {
            200: ServicesModel.createResponse,
            400: ServicesModel.alreadyExists,
        },
    })

    .delete("/:id", async ({ params }) => ServicesService.deleteById(params), {
        params: ServicesModel.serviceIdParam,
        response: {
            200: ServicesModel.getByIdResponse,
            404: ServicesModel.notFound,
        },
        hasRole: UserRole.Admin,
    })

    .get("/", async () => ServicesService.getAll())

    .get("/:id", async ({ params }) => ServicesService.getById(params), {
        params: ServicesModel.serviceIdParam,
        response: {
            200: ServicesModel.getByIdResponse,
            404: ServicesModel.notFound,
        },
        isAuthenticated: true,
    });
