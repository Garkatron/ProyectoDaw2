import { Elysia } from 'elysia'
import { AuthGuard } from '../auth/guard'
import { UserRole } from '@limpora/common/src/enums/Role.enum'
import { BookingService } from './service'
import { BookingModel } from './model'

export const bookingController  = new Elysia({ prefix: '/user' })
    .use(AuthGuard)
    .post("/", async ({ body }) => BookingService.assign(body), {
        body: BookingModel.assignBody,
        response: {
            403: BookingModel.forbidden,
            404: BookingModel.notFound,
            409: BookingModel.dateOccupied,
        },
        hasRole: [UserRole.Admin]
    })
    .put("/status", async ({ body }) => BookingService.updateStatus(body), {
        body: BookingModel.updateStatusBody,
        response: {
            404: BookingModel.notFound,
        },
        hasRole: [UserRole.Admin]
    })