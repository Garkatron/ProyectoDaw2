import { Elysia, t } from "elysia";
import { AuthGuard } from "../auth/guard";
import { MediaService } from "./service";
import { MediaModel } from "./model";


export const mediaController = new Elysia({ prefix: "/media" })
    .use(AuthGuard)

    .group("/me", (app) =>
        app
            .post(
                "/profile",
                ({ user, body }) =>
                    MediaService.setProfileImageMe(body, user.uid),
                {
                    body: MediaModel.fileBody,
                    response: {
                        201: MediaModel.postImageResponse,
                    },
                    isAuthenticated: true,
                },
            )
            .get("/profile", ({ user }) => MediaService.getProfileImageMe(user.uid), {
                response: {
                    200: MediaModel.getImageResponse,
                },
                isAuthenticated: true,
            })
            .post(
                "/banner",
                ({ user, body }) =>
                    MediaService.setBannerImageMe(body, user.uid),
                {
                    body: MediaModel.fileBody,
                    response: {
                        201: MediaModel.postImageResponse,
                    },
                    isAuthenticated: true,
                },
            )
            .get("/banner", ({ user }) => MediaService.getBanerImageMe(user.uid), {
                response: {
                    200: MediaModel.getImageResponse,
                },
                isAuthenticated: true,
            }),
    );