import Elysia from "elysia";
import { ServicesModel } from "./model";
import { ServicesService } from "./service";
import { AuthGuard } from "../auth/guard";
import { UserRole } from "../../enums/Role.enum";

export const servicesController = new Elysia({ prefix: '/services' })
    .use(AuthGuard)

    .post('/create',
        async ({ body }) => ServicesService.create(body),
        {
            body: ServicesModel.createBody,
            response: {
                200: ServicesModel.createResponse,
                400: ServicesModel.alreadyExists,
            },
            hasRole: UserRole.Admin,
        }
    )

    .get('/',
        async () => ServicesService.getAll(),
    )

    .get('/:id',
        async ({ params }) => ServicesService.getById(params),
        {
            params: ServicesModel.serviceIdParam,
            response: {
                200: ServicesModel.getByIdResponse,
                404: ServicesModel.notFound,
            },
            isAuthenticated: true,
        }
    )