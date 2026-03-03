import { t, UnwrapSchema } from "elysia";
import { PaymentMethod, AppointmentStatus } from "@limpora/common";

const BookingSchema = t.Object({
    id: t.Number(),
    date_time: t.String(),
    status: t.Enum(AppointmentStatus),
    price: t.Number(),
    app_commission: t.Number(),
    payment_method: t.Enum(PaymentMethod),
    user_id: t.Number(),
    provider_id: t.Number(),
    service_id: t.Number(),
    created_at: t.String(),
    service_name: t.String(),
});

const BookingErrors = {
    notFound: t.Union([
        t.Literal("Appointment not found"),
        t.Literal("User not found"),
    ]), // 404

    forbidden: t.Union([
        t.Literal("You cannot contrat yourself"),
        t.Literal("User is not a provider"),
        t.Literal("User is not a client"),
        t.Literal("You cannot have appointments"),
        t.Literal("You cannot contrat a non provider user"),
        t.Literal("You can only delete your own appointments"),
    ]), // 403

    dateOccupied: t.Literal("Date occupied"), // 409
};
export const BookingModel = {
    clientIdParam: t.Object({ client_id: t.String() }),
    providerIdParam: t.Object({ provider_id: t.String() }),

    assignBody: t.Object({
        service_id: t.Number(),
        provider_id: t.Number(),
        client_id: t.Number(),
        price: t.Number(),
        date: t.String(),
        payment_method: t.Enum(PaymentMethod),
    }),

    assignMeBody: t.Object({
        service_id: t.Number(),
        provider_id: t.Number(),
        price: t.Number(),
        date: t.String(),
        payment_method: t.Enum(PaymentMethod),
    }),

    updateStatusBody: t.Object({
        id: t.Number(),
        status: t.Enum(AppointmentStatus),
    }),

    assignResponse: BookingSchema,
    updateResponse: BookingSchema,
    listResponse: t.Array(BookingSchema),
    getByProviderResponse: t.Array(BookingSchema),

    ...BookingErrors,
} as const;

export type BookingModel = {
    [k in keyof typeof BookingModel]: UnwrapSchema<(typeof BookingModel)[k]>;
};
