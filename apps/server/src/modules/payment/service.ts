import { db } from "../../libs/db";
import { stripeClient } from "../../libs/stripe";
import { fail } from "../../utils";
import { PaymentModel } from "./model";

export abstract class PaymentService {
    static async doPayment(
        { amount }: PaymentModel["doPaymentBody"],
        uid: string,
    ): Promise<PaymentModel["doPaymentResponse"]> {
        try {
            const paymentIntent = await stripeClient.paymentIntents.create({
                amount,
                currency: "eur",
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            return { client_secret: paymentIntent.client_secret! };
        } catch (error) {
            throw fail(
                500,
                "Payment Intent creation failed" satisfies PaymentModel["stripeError"],
            );
        }
    }
    static async confirmAndUpgradeBooking(
        appointmentId: number,
        paymentIntentId: string,
        uid: string,
    ) {
        try {
            const paymentIntent =
                await stripeClient.paymentIntents.retrieve(paymentIntentId);

            if (paymentIntent.status !== "succeeded") {
                throw new Error("Payment not verified");
            }

            const result = db.run(
                `
                UPDATE Appointments 
                SET status = 'Pending', payment_method = 'Stripe' 
                WHERE id = ? AND client_id = (SELECT id FROM Users WHERE uid = ?) AND status = 'Pending Payment'
            `,
                [appointmentId, uid],
            );

            if (result.changes === 0) {
                throw fail(403,"Appointment not found or already processed")
            }

            return { success: true, status: "Pending" };
        } catch (error) {
            throw fail(400, "Failed to confirm payment");
        }
    }
}
