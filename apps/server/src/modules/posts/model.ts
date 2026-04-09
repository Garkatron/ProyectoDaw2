import { t, type UnwrapSchema } from "elysia";

export const PostModel = {
    postBody: t.Object({
        title: t.String({
            minLength: 3,
            error: "Title must be at least 3 characters",
        }),
        content: t.String(),
    }),

    postResponse: t.Object({
        id: t.Numeric(),
        title: t.String(),
        content: t.String(),
    }),

    postResponseAll: t.Array(t.Object({
        id: t.Numeric(),
        title: t.String(),
        content: t.String(),
    })),



    postIdQuery: t.Object({
        id: t.String(),
    }),

    errorPostNotFound: t.Literal(
        "The requested post was not found",
    ),

    errorServiceNotFound: t.Literal(
        "The requested service assignment was not found",
    ),
    errorUserNotFound: t.Literal(
        "The specified user could not be found in our records",
    ),
    errorAlreadyExists: t.Literal(
        "This service is already assigned to this provider",
    ),
    errorForbiddenRole: t.Literal(
        "Access denied: Only providers can manage services",
    ),
    errorUnauthorizedAction: t.Literal(
        "You do not have permission to modify this provider's data",
    ),
    errorPersistenceFailed: t.Literal(
        "The changes could not be saved to the database. Please try again later",
    ),
};

export type PostModel = {
    [k in keyof typeof PostModel]: UnwrapSchema<(typeof PostModel)[k]>;
};
