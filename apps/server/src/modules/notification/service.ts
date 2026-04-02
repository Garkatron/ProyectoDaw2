// ? NotificationService
// ! -------------------
// * Responsible for handling user notifications.
// * Provides methods for sending email notifications and in-app notifications.

import { RESEND } from "../../libs/resend";
import { NotificationModel } from "./model";
import { status } from "elysia";
import { NotificationQueries } from "./queries";
import { UserService } from "../user/service";
import { fail } from "../../utils";

const VERIFICATION_TEMPLATE = await Bun.file(
    import.meta.dir + "/templates/vec.html",
).text();
const BOOKING_CONFIRMATION_TEMPLATE = await Bun.file(
    import.meta.dir + "/templates/bok.html",
).text();

export abstract class NotificationService {
    static async sendVerificationEmail({
        to,
        code,
    }: NotificationModel["authEmail"]): Promise<
        NotificationModel["emailResponse"]
    > {
        const html = VERIFICATION_TEMPLATE.replace(/\{\{code\}\}/g, code);
        const response = await NotificationService.sendEmail({
            to,
            from: process.env.RESEND_AUTH_EMAIL!,
            subject: "Limpora Email Verification Code",
            content: html,
        });

        return response;
    }

    static async sendConfirmationEmail({
        to,
        client_name,
        provider_name,
        payment_method,
        total_price,
        date,
        time,
        end_time,
        service_name,
        booking_id,
    }: NotificationModel["confirmationEmailBody"]): Promise<
        NotificationModel["emailResponse"]
    > {
        const patterns = {
            "{{client_name}}": client_name,
            "{{provider_name}}": provider_name,
            "{{service_name}}": service_name,
            "{{date}}": new Date(date).toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            }),
            "{{time}}": time.substring(11, 16),
            "{{end_time}}": end_time.substring(11, 16),
            "{{total_price}}": total_price,
            "{{payment_method}}": payment_method,
            "{{booking_id}}": booking_id,
        };

        let html = BOOKING_CONFIRMATION_TEMPLATE;

        for (const [pattern, value] of Object.entries(patterns)) {
            html = html.replaceAll(pattern, value);
        }

        const response = await NotificationService.sendEmail({
            to,
            from: process.env.RESEND_NOTIFICATION_EMAIL!,
            subject: "Limpora Booking Confirmation",
            content: html,
        });

        return response;
    }

    static async sendEmail({
        from,
        to,
        subject,
        content,
    }: NotificationModel["emailBody"]): Promise<
        NotificationModel["emailResponse"]
    > {
        const response = await RESEND.emails.send({
            from,
            to,
            subject,
            html: content,
        });

        if (response.error && !response.data) {

            throw fail(
                400,
                "Error sending Email notifiaction" satisfies NotificationModel["error"],
            );
        }

        return response.data;
    }

    static async sendInbox({
        user_id,
        content,
        expires_at,
    }: NotificationModel["notificationBody"]): Promise<
        NotificationModel["appResponse"]
    > {
        const { lastInsertRowid } = NotificationQueries.insert.run({
            user_id,
            content,
            expires_at,
        });

        return { id: Number(lastInsertRowid) };
    }

    static async getInbox({
        user_id,
    }: NotificationModel["getNotificationsParams"]): Promise<
        NotificationModel["getAllNotificationsResponse"]
    > {
        const response = NotificationQueries.findByUserId.all({
            user_id,
        });

        return response;
    }

    static async getInboxMe(
        uid: string,
    ): Promise<NotificationModel["getAllNotificationsResponse"]> {
        const user = await UserService.getMe({ uid });

        return NotificationService.getInbox({ user_id: user.id });
    }

    static async patchReadMe(
        { id }: NotificationModel["notificationIdParam"],
        uid: string,
    ): Promise<NotificationModel["patchResponse"]> {
        
        await UserService.getMe({ uid });
        const { changes } = NotificationQueries.markAsRead.run({ id });

        return { changes };
    }

    static async patchAllReadMe(
        { id }: NotificationModel["notificationIdParam"],
        uid: string,
    ): Promise<NotificationModel["patchResponse"]> {
        
        const user = await UserService.getMe({ uid });
        const { changes } = NotificationQueries.markAllAsRead.run({ user_id: user.id });

        return { changes };
    }
}
