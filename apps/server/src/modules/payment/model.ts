import { t, type UnwrapSchema } from "elysia";

export const PaymentModel = {
    doPaymentBody: t.Object({
        amount: t.Number(),
    }),
    doPaymentResponse: t.Object({
        client_secret: t.String(),
    }),
    confirmPaymentBody: t.Object({
        paymentIntentId: t.String(),
        appointmentId: t.Number(),
    }),
    confirmPaymentResponse: t.Object({
        success: t.Boolean(),
        status: t.String(),
    }),
    stripeError: t.Literal("Payment Intent creation failed"),
} as const;

export type PaymentModel = {
    [k in keyof typeof PaymentModel]: UnwrapSchema<(typeof PaymentModel)[k]>;
};
