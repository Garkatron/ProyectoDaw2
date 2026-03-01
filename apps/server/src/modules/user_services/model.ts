import { t, type UnwrapSchema } from 'elysia';

const ProviderServiceObject = t.Object({
    user_id: t.Number(),
    service_id: t.Number(),
    price: t.Number({ minimum: 0 }),
    is_active: t.Boolean(),
    created_at: t.String(),
    updated_at: t.String(),
});

export const ProviderServicesModel = {
    providerIdParam: t.Object({ provider_id: t.String() }),
    serviceIdParam: t.Object({ service_id: t.String() }),
    providerAndServiceIdParam: t.Object({ provider_id: t.String(), service_id: t.String() }),

    assignServiceBody: t.Object({
        service_id: t.Number(),
        price: t.Number({ minimum: 0 }),
    }),

    unassingServiceBody: t.Object({
        service_id: t.Number(),
    }),
    
    updatePriceBody: t.Object({
        price: t.Number({ minimum: 0 }),
    }),

    getAllResponse: t.Array(ProviderServiceObject),
    getByProviderIdResponse: ProviderServiceObject,
    assignResponse: ProviderServiceObject,
    unassignResponse: ProviderServiceObject,

    notFound: t.Literal('Service not found'),
    userNotFound: t.Literal('User not found'),
    alreadyExists: t.Literal('Service already assigned to this provider'),
    forbidden: t.Literal('Only providers can have services'),
} as const;

export type ProviderServicesModel = {
    [k in keyof typeof ProviderServicesModel]: UnwrapSchema<(typeof ProviderServicesModel)[k]>;
};
