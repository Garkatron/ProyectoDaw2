import { t, type UnwrapSchema } from 'elysia';

export const ServicesModel = {
    serviceIdParam: t.Object({
        id: t.String(),
    }),

    createBody: t.Object({
        name: t.String(),
        duration: t.Number(),
    }),

    getAllResponse: t.Array(
        t.Object({
            id: t.Number(),
            name: t.String(),
            duration: t.String(),
        })
    ),

    getByIdResponse: t.Object({
        id: t.Number(),
        name: t.String(),
        duration: t.String(),
    }),

    createResponse: t.Object({
        id: t.Number(),
        name: t.String(),
        duration: t.Number(),
    }),

    notFound: t.Literal('Service not found'),
    alreadyExists: t.Literal('Service already exists'),
} as const;

export type ServicesModel = {
    [k in keyof typeof ServicesModel]: UnwrapSchema<(typeof ServicesModel)[k]>;
};
