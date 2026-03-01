import { t, type UnwrapSchema } from 'elysia';

const ReviewObject = t.Object({
    id: t.Number(),
    content: t.Nullable(t.String()), 
    rating: t.Number(),
    reviewer_id: t.Number(),
    reviewed_id: t.Number(),
    created_at: t.String(),
});

export const ReviewsModel = {
    reviewIdParam: t.Object({ id: t.String() }),
    clientIdParam: t.Object({ client_id: t.String() }),
    providerIdParam: t.Object({ provider_id: t.String() }),

    publishReviewBody: t.Object({
        reviewed_id: t.Number(),
        content: t.String({ maxLength: 200 }),
        rating: t.Number({ minimum: 1, maximum: 5 }),
    }),

    getAllResponse: t.Array(ReviewObject),
    getReviewByIdResponse: ReviewObject,
    getReviewByClientIdResponse: t.Array(ReviewObject),
    getReviewByProviderIdResponse: t.Array(ReviewObject),
    publishReviewResponse: ReviewObject,

    notFound: t.Literal('Review not found'),
    userNotFound: t.Literal('User not found'),
    alreadyExists: t.Literal('You already reviewed this user'),
    forbidden: t.Literal('You cannot review yourself'),
    forbiddenNotOwner: t.Literal('You can only delete your own reviews'),
} as const;

export type ReviewsModel = {
    [k in keyof typeof ReviewsModel]: UnwrapSchema<(typeof ReviewsModel)[k]>;
};
