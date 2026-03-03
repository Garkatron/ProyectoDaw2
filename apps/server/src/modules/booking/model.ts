import { t, type UnwrapSchema } from "elysia";
import { PaymentMethod, AppointmentStatus } from "@limpora/common";

const BookingSchema = t.Object({
    id: t.Number(),
    // Time
    start_time: t.String(),         // ISO8601
    end_time: t.String(),           // ISO8601
    travel_buffer_min: t.Number(),  // Displacement margin
    
    status: t.Enum(AppointmentStatus),
    
    // Economy
    total_price: t.Number(),        // What the customer pays
    provider_net: t.Number(),       // What the self-employed person receives
    app_commission: t.Number(),     
    
    payment_method: t.Enum(PaymentMethod),
    

    user_id: t.Number(),            // Client ID 
    provider_id: t.Number(),
    service_id: t.Number(),
    
    created_at: t.String(),
    service_name: t.String(),       // join + Services
});

const BookingErrors = {
    notFound: t.Union([
        t.Literal("Appointment not found"),
        t.Literal("User not found"),
        t.Literal("Service not found"),
    ]), 

    forbidden: t.Union([
        t.Literal("You cannot contract yourself"),
        t.Literal("User is not a provider"),
        t.Literal("User is not a client"),
        t.Literal("Admins can't have appointments"),
        t.Literal("User does not offer this service"), 
        t.Literal("You can only manage your own appointments"),
    ]), 

    // Agenda conflicts
    dateOccupied: t.Union([
        t.Literal("Date occupied"), 
        t.Literal("Provider is not available in this timeframe"),
    ]), 
};

export const BookingModel = {
    clientIdParam: t.Object({ client_id: t.Numeric() }),
    providerIdParam: t.Object({ provider_id: t.Numeric() }),
    appointmentIdParam: t.Object({ id: t.Numeric() }),

    // Assing
    assignBody: t.Object({
        service_id: t.Number(),
        provider_id: t.Number(),
        client_id: t.Number(),
        start_time: t.String(),     // "2024-05-20T10:00:00Z"
        duration_hours: t.Number({ minimum: 1 }), // Calc el end_time
        payment_method: t.Enum(PaymentMethod),
    }),

    assignMeBody: t.Object({
        service_id: t.Number(),
        provider_id: t.Number(),
        start_time: t.String(),
        duration_hours: t.Number({ minimum: 1 }),
        payment_method: t.Enum(PaymentMethod),
    }),

    updateStatusBody: t.Object({
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