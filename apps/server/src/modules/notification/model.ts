import { t, type UnwrapSchema } from "elysia";

const NotificationSchema = t.Object({
        id: t.Number(),
        content: t.String(),
        read: t.Number(),
        created_at: t.String(),
        expires_at: t.String(),
    });

export const NotificationModel = {
     notificationResponse: t.Object({
        id: t.Number(),
    }),
 notificationIdParam: t.Object({
        id: t.Number(),
    }),


    emailBody: t.Object({
        from: t.String({ format: "email" }),
        to: t.Union([
            t.String({ format: "email" }),
            t.Array(t.String({ format: "email" })),
        ]),
        subject: t.String({ maxLength: 30 }),
        content: t.String(),
    }),

    authEmail: t.Object({
        to: t.Union([
            t.String({ format: "email" }),
            t.Array(t.String({ format: "email" })),
        ]),
        code: t.String({ minLength: 6 }),
    }),

    confirmationEmailBody: t.Object({
        to: t.Union([
            t.String({ format: "email" }),
            t.Array(t.String({ format: "email" })),
        ]),
        client_name: t.String(),
        provider_name: t.String(),
        service_name: t.String(),
        date: t.String(),
        time: t.String(),
        end_time: t.String(),
        total_price: t.String(),
        payment_method: t.String(),
        booking_id: t.String(),
    }),

    notificationBody: t.Object({
        user_id: t.Number({ minimum: 0 }),
        content: t.String({ maxLength: 100 }),
        expires_at: t.String(),
    }),

   
    getNotificationsParams: t.Object({
        user_id: t.Numeric({ minimum: 0 }),
    }),

    getAllNotificationsResponse: t.Array(NotificationSchema),
    patchResponse: t.Object({ changes: t.Number() }),

    emailResponse: t.Object({
        id: t.String(),
    }),

    appResponse: t.Object({
        id: t.Number(),
    }),

    error: t.Literal("Error sending Email notifiaction"),
};

export type NotificationModel = {
    [k in keyof typeof NotificationModel]: UnwrapSchema<
        (typeof NotificationModel)[k]
    >;
};
