import { Elysia, t } from "elysia";
import { AuthGuard } from "../auth/guard";
import { MediaService } from "./service";
import { MediaModel } from "./model";


export const mediaController = new Elysia({ prefix: "/bookings" })
    .use(AuthGuard)

    .group("/me", (app) =>
        app
            .post(
                "/",
                ({ user, body }) =>
                    MediaService.setProfileImageMe(body, user.uid),
                {
                    body: MediaModel.postImageBody,
                    response: {
                        201: MediaModel.postImageResponse,
                    },
                    isAuthenticated: true,
                },
            )
            .get("/", ({ user }) => MediaService.getProfileImageMe(user.uid), {
                response: {
                    200: MediaModel.getImageResponse,
                },
                isAuthenticated: true,
            }),
    );