// ? NotificationService
// ! -------------------
// * Responsible for handling user notifications.
// * Provides methods for sending email notifications and in-app notifications.

import { RESEND } from "../../libs/resend";
import { NotificationModel } from "./model";
import { status } from "elysia";
import { NotificationQueries } from "./queries";

const VERIFICATION_TEMPLATE = await Bun.file("./templates/vec.html").text();
export abstract class NotificationService {
    static async verificationEmail({ to, code }: NotificationModel["authEmail"]): Promise<NotificationModel["emailResponse"]> {
        

        const html = await VERIFICATION_TEMPLATE.replace("{{code}}", code);
        
        const response = await NotificationService.email({
            to,
            from: process.env.RESEND_AUTH_EMAIL!,
            subject: "Limpora Email Verification Code",
            content: html,
        });

        return response;
    }

    static async email({
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
            throw status(400, NotificationModel["error"]);
        }

        return response.data;
    }

    static async app({
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
