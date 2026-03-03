import { t, type UnwrapSchema } from "elysia";

// UserServices + Services
const ProviderServiceObject = t.Object({
    user_id: t.Number(),
    service_id: t.Number(),
    price_per_h: t.Number({ minimum: 0 }),
    is_active: t.Boolean(),
    created_at: t.String(),
    updated_at: t.String(),

    // Join Services
    service_name: t.String(),
    category: t.Optional(t.String()),
});

export const ProviderServicesModel = {
    providerIdParam: t.Object({ provider_id: t.Numeric() }),
    serviceIdParam: t.Object({ service_id: t.Numeric() }),
    providerAndServiceIdParam: t.Object({
        provider_id: t.Numeric(),
        service_id: t.Numeric(),
    }),

    assignServiceBody: t.Object({
        service_id: t.Number(),
        price_per_h: t.Number({ minimum: 1 }),
    }),

    updatePriceBody: t.Object({
        price_per_h: t.Number({ minimum: 1 }),
    }),

    toggleActiveBody: t.Object({
        is_active: t.Boolean(),
    }),

    getAllResponse: t.Array(ProviderServiceObject),
    getOneResponse: ProviderServiceObject,

    notFound: t.Literal("Service not found"),
    userNotFound: t.Literal("User not found"),
    alreadyExists: t.Literal("Service already assigned to this provider"),
    forbidden: t.Literal("Only providers can have services"),
} as const;

export type ProviderServicesModel = {
    [k in keyof typeof ProviderServicesModel]: UnwrapSchema<
        (typeof ProviderServicesModel)[k]
    >;
};
