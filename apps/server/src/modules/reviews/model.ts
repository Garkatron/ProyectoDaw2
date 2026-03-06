import { t, type UnwrapSchema } from "elysia";

const ReviewObject = t.Object({
    id: t.Number(),
    content: t.Nullable(t.String()),
    rating: t.Number({ minimum: 1, maximum: 5 }),
    reviewer_id: t.Number(),
    reviewed_id: t.Number(),
    appointment_id: t.Number(),
    created_at: t.String(),
    reviewer_name: t.Optional(t.String()),
});

export const ReviewsModel = {
    reviewIdParam: t.Object({ id: t.Numeric() }),
    clientIdParam: t.Object({ client_id: t.Numeric() }),
    providerIdParam: t.Object({ provider_id: t.Numeric() }),
    appointmentIdParam: t.Object({ appointment_id: t.Numeric() }),

    publishReviewBody: t.Object({
        appointment_id: t.Number(),
        content: t.Nullable(t.String({ maxLength: 500 })),
        rating: t.Number({ minimum: 1, maximum: 5 }),
    }),

    getAllResponse: t.Array(ReviewObject),
    getOneResponse: ReviewObject,

    notFound: t.Literal("Review not found"),
    appointmentNotFound: t.Literal("Appointment not found"),
    userNotFound: t.Literal("User not found"),
    alreadyExists: t.Literal("You have already reviewed this appointment"),
    forbidden: t.Literal("You cannot review yourself"),
    forbiddenNotOwner: t.Literal("You can only manage your own reviews"),
    forbiddenNotCompleted: t.Literal(
        "You can only review completed appointments",
    ),
} as const;

export type ReviewsModel = {
    [k in keyof typeof ReviewsModel]: UnwrapSchema<(typeof ReviewsModel)[k]>;
};
