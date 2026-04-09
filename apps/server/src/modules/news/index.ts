import Elysia from "elysia";
import { AuthGuard } from "../auth/guard";
import { NewsService } from "./service";
import { PostModel } from "./model";
import { UserRole } from "@limpora/common";

export const newsServiceController = new Elysia({ prefix: "/news" })
    .use(AuthGuard)
    .get("/", async () => NewsService.getAllPosts(), {
        response: { 200: PostModel.postResponseAll },
        isAuthenticated: false,
    })
    .get("/:id", async ({ params }) => NewsService.getPost(params), {
        params: PostModel.postIdQuery,
        response: { 200: PostModel.postBody },
        isAuthenticated: false,
    })
    .post("/", ({ user, body }) => NewsService.createPostsMe(body, user.uid), {
        body: PostModel.postBody,
        response: {
            201: PostModel.postBody,
            500: PostModel.errorPersistenceFailed,
        },
        hasRole: UserRole.Admin,
    })
    .patch(
        "/:id",
        ({ user, body, params }) =>
            NewsService.updatePostsMe(body, params, user.uid),
        {
            params: PostModel.postIdQuery,
            body: PostModel.postBody,
            response: {
                201: PostModel.postBody,
                403: PostModel.errorUnauthorizedAction,
                404: PostModel.errorPostNotFound,
            },
            hasRole: UserRole.Admin,
        },
    )
    .delete(
        "/:id",
        async ({ params, user }) => NewsService.deletePostsMe(params, user.uid),
        {
            params: PostModel.postIdQuery,
            hasRole: UserRole.Admin,
        },
    );
