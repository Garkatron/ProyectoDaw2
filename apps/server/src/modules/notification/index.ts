import { Elysia, t } from "elysia";
import { AuthGuard } from "../auth/guard";
import { UserRole } from "@limpora/common";
import { NotificationService } from "./service";
import { NotificationModel } from "./model";

export const notificationController = new Elysia({ prefix: "/notifications" })
    .use(AuthGuard)
    .patch(
        "/:id/read",
        ({ params, user }) => NotificationService.patchReadMe(params, user.uid),
        {
            params: NotificationModel.notificationIdParam,
            response: { 200: NotificationModel.patchResponse },
            isAuthenticated: true
        },
    )
    .patch(
        "/read",
        ({ params, user }) => NotificationService.patchAllReadMe(params, user.uid),
        {
            params: NotificationModel.notificationIdParam,
            response: { 200: NotificationModel.patchResponse },
            isAuthenticated: true
        },
    )
    .get(
        "/me",
        ({ user }) => NotificationService.getInboxMe(user.uid),
        {
            response: { 200: NotificationModel.getAllNotificationsResponse },
            isAuthenticated: true
        },
    );

