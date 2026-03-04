import { t, type UnwrapSchema } from "elysia";

export const NotificationModel = {
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
        code: t.String({minLength: 6})
    }),

    notificationBody: t.Object({
        user_id: t.Number({ minimum: 0 }),
        content: t.String({ maxLength: 100 }),
        expires_at: t.String(),
    }),

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
