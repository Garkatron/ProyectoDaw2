import Elysia from "elysia";
import { PaymentService } from "./service";
import { PaymentModel } from "./model";
import { AuthGuard } from "../auth/guard";

export const paymentController = new Elysia({ prefix: "/payment" })
    .use(AuthGuard)

    .post("/", ({ user, body }) => PaymentService.doPayment(body, user.uid), {
        body: PaymentModel["doPaymentBody"],
        response: {
            201: PaymentModel.doPaymentResponse,
            500: PaymentModel.stripeError,
        },
        isAuthenticated: true,
    })
    .post(
        "/confirm",
        ({ body, user }) =>
            PaymentService.confirmAndUpgradeBooking(
                body.appointmentId,
                body.paymentIntentId,
                user.uid,
            ),
        {
            body: PaymentModel.confirmPaymentBody,
            isAuthenticated: true,
        },
    );
