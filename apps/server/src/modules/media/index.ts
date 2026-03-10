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
                        400: MediaModel.invalidType,
                        502: MediaModel.uploadFailed,
                    },
                    isAuthenticated: true,
                },
            )
            .get(
                "/profile",
                ({ user }) => MediaService.getProfileImageMe(user.uid),
                {
                    response: {
                        200: MediaModel.getImageResponse,
                        502: MediaModel.uploadFailed,
                    },
                    isAuthenticated: true,
                },
            )
            .post(
                "/banner",
                ({ user, body }) =>
                    MediaService.setBannerImageMe(body, user.uid),
                {
                    body: MediaModel.fileBody,
                    response: {
                        201: MediaModel.postImageResponse,
                        400: MediaModel.invalidType,
                        502: MediaModel.uploadFailed,
                    },
                    isAuthenticated: true,
                },
            )
            .get(
                "/banner",
                ({ user }) => MediaService.getBannerImageMe(user.uid),
                {
                    response: {
                        200: MediaModel.getImageResponse,
                        502: MediaModel.uploadFailed,
                    },
                    isAuthenticated: true,
                },
            ),
    )
    .get("/profile/:id", ({ params }) => MediaService.getProfileImage(params), {
        params: MediaModel.profileParams,
        response: {
            200: MediaModel.getImageResponse,
            502: MediaModel.uploadFailed,
        },
    })
    .get("/banner/:id", ({ params }) => MediaService.getBannerImage(params), {
        params: MediaModel.bannerParams,
        response: {
            200: MediaModel.getImageResponse,
            502: MediaModel.uploadFailed,
        },
    });
