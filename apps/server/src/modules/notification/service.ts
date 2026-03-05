// ? NotificationService
// ! -------------------
// * Responsible for handling user notifications.
// * Provides methods for sending email notifications and in-app notifications.

import { RESEND } from "../../libs/resend";
import { NotificationModel } from "./model";
import { status } from "elysia";
import { NotificationQueries } from "./queries";

const VERIFICATION_TEMPLATE = await Bun.file(
    import.meta.dir + "/templates/vec.html",
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
            console.log(response.error);
            
            throw status(400, "Error sending Email notifiaction" satisfies NotificationModel["error"]);
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
}
