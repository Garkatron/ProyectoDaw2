import { Elysia } from 'elysia'
import { AuthGuard } from '../auth/guard'
import { UserRole } from '../../enums/Role.enum'
import { ProviderServicesService } from './service'
import { ProviderServicesModel } from './model'

export const providerServicesController = new Elysia({ prefix: '/providers' })
    .use(AuthGuard)

    .get('/',
        async () => ProviderServicesService.getAll(),
        {
            response: {
                200: ProviderServicesModel.getAllResponse,
            },
            hasRole: UserRole.Admin,
        }
    )

    .get('/:provider_id/services',
        async ({ params }) => ProviderServicesService.getByProviderId(params),
        {
            params: ProviderServicesModel.providerIdParam,
            response: {
                200: ProviderServicesModel.getAllResponse,
                404: ProviderServicesModel.userNotFound,
            },
            isAuthenticated: true,
        }
    )

    .get('/:provider_id/services/:service_id',
        async ({ params }) => ProviderServicesService.getByProviderAndServiceId(params),
        {
            params: ProviderServicesModel.providerAndServiceIdParam,
            response: {
                200: ProviderServicesModel.getByProviderIdResponse,
                404: ProviderServicesModel.notFound,
            },
            isAuthenticated: true,
        }
    )

    .post('/me/services/assign',
        async ({ body, user }) => ProviderServicesService.assignByUid(body, user.uid),
        {
            body: ProviderServicesModel.assignServiceBody,
            response: {
                200: ProviderServicesModel.assignResponse,
                400: ProviderServicesModel.alreadyExists,
                403: ProviderServicesModel.forbidden,
            },
            hasRole: UserRole.Provider,
        }
    )

    .post('/:provider_id/services/assign',
        async ({ body, params }) => ProviderServicesService.assign(body, Number(params.provider_id)),
        {
            body:   ProviderServicesModel.assignServiceBody,
            params: ProviderServicesModel.providerIdParam,
            response: {
                200: ProviderServicesModel.assignResponse,
                400: ProviderServicesModel.alreadyExists,
                404: ProviderServicesModel.userNotFound,
            },
            hasRole: UserRole.Admin,
        }
    )

    .delete('/me/services/unassign',
        async ({ body, user }) => ProviderServicesService.unassignByUid(body, user.uid),
        {
            body: ProviderServicesModel.unassingServiceBody,
            response: {
                200: ProviderServicesModel.unassignResponse,
                404: ProviderServicesModel.notFound,
            },
            hasRole: UserRole.Provider,
        }
    )

    .delete('/:provider_id/services/unassign',
        async ({ body, params }) => ProviderServicesService.unassign(body, Number(params.provider_id)),
        {
            body:   ProviderServicesModel.unassingServiceBody,
            params: ProviderServicesModel.providerIdParam,
            response: {
                200: ProviderServicesModel.unassignResponse,
                404: ProviderServicesModel.notFound,
            },
            hasRole: UserRole.Admin,
        }
    )