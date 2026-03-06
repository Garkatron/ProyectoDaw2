import { Elysia } from 'elysia';
import { AuthGuard } from '../auth/guard';
import { UserRole } from '@limpora/common';
import { ReviewsService } from './service';
import { ReviewsModel } from './model';

export const reviewsController = new Elysia({ prefix: '/reviews' })
    .use(AuthGuard)

    .post('/me', async ({ body, user }) => ReviewsService.publishMe(body, user.uid), {
        body: ReviewsModel.publishReviewBody,
        response: {
            201: ReviewsModel.getOneResponse,
            400: ReviewsModel.alreadyExists,
            403: ReviewsModel.forbidden,
            404: ReviewsModel.appointmentNotFound
        },
        hasRole: UserRole.Client,
    })

    .get('/:id', async ({ params }) => ReviewsService.getById(params), {
        params: ReviewsModel.reviewIdParam,
        response: {
            200: ReviewsModel.getOneResponse,
            404: ReviewsModel.notFound
        },
        isAuthenticated: true
    })

    .get('/provider/:provider_id', async ({ params }) => ReviewsService.getByProvider(params.provider_id), {
        params: ReviewsModel.providerIdParam,
        response: {
            200: ReviewsModel.getAllResponse,
            404: ReviewsModel.userNotFound
        },
        isAuthenticated: true
    })

    .get('/client/:client_id', async ({ params }) => ReviewsService.getByClientId(params), {
        params: ReviewsModel.clientIdParam,
        response: {
            200: ReviewsModel.getAllResponse,
            404: ReviewsModel.userNotFound
        },
        isAuthenticated: true
    })
    .get('/appointment/:appointment_id', async ({ params }) => ReviewsService.getByAppointmentId(params), {
        params: ReviewsModel.appointmentIdParam,
        response: {
            200: ReviewsModel.getOneResponse,
            404: ReviewsModel.notFound,
        },
        isAuthenticated: true,
    });
    

   /*
    .delete('/:id', async ({ params, user }) => {
        const requester = await ReviewsService.getProviderByUid(user.uid);
        const isAdmin = user.role === UserRole.Admin;
        return ReviewsService.delete(params.id, requester.id, isAdmin);
    }, {
        params: ReviewsModel.reviewIdParam,
        response: {
            200: t.Object({ success: t.Boolean() }),
            403: ReviewsModel.forbiddenNotOwner,
            404: ReviewsModel.notFound
        },
        isAuthenticated: true 
    });*/