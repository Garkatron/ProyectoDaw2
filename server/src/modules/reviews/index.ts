import { Elysia } from 'elysia';
import { AuthGuard } from '../auth/guard';
import { UserRole } from '../../enums/Role.enum';
import { ReviewsService } from './service';
import { ReviewsModel } from './model';

export const reviewsController = new Elysia({ prefix: '/reviews' })
    .use(AuthGuard)

    .post('/publish', async ({ body, user }) => ReviewsService.publish(body, user.uid), {
        body: ReviewsModel.publishReviewBody,
        response: {
            200: ReviewsModel.publishReviewResponse,
            400: ReviewsModel.alreadyExists,
        },
        hasRole: UserRole.Client,
    })

    .get('/:id', async ({ params }) => ReviewsService.getById(params), {
        params: ReviewsModel.reviewIdParam,
        response: {
            200: ReviewsModel.getReviewByIdResponse,
            404: ReviewsModel.notFound,
            400: ReviewsModel.userNotFound,
        },
        isAuthenticated: true,
    })
    .get('/client/:client_id', async ({ params }) => ReviewsService.getByClientId(params), {
        params: ReviewsModel.clientIdParam,
        response: {
            200: ReviewsModel.getReviewByClientIdResponse,
            404: ReviewsModel.notFound,
            400: ReviewsModel.userNotFound,
        },
        isAuthenticated: true,
    })
    .get('/provider/:provider_id', async ({ params }) => ReviewsService.getByProviderId(params), {
        params: ReviewsModel.providerIdParam,
        response: {
            200: ReviewsModel.getReviewByProviderIdResponse,
            404: ReviewsModel.notFound,
            400: ReviewsModel.userNotFound,
        },
        isAuthenticated: true,
    });
