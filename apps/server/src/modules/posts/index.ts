import Elysia from "elysia";
import { AuthGuard } from "../auth/guard";
import { PostService } from "./service";
import { PostModel } from "./model";
import { UserRole } from "@limpora/common";

export const postServiceController = new Elysia({ prefix: "/post" })
    .use(AuthGuard)
    .get("/", async () => PostService.getAllPosts(), {
        response: { 200: PostModel.postResponseAll },
        isAuthenticated: false,
    })
    .get("/:id", async ({ params }) => PostService.getPost(params), {
        response: { 200: PostModel.postBody },
        isAuthenticated: false,
    })
    .post("/", ({ user, body }) => PostService.createPostsMe(body, user.uid), {
        body: PostModel.postBody,
        response: {
            201: PostModel.postBody,
            500: PostModel.errorPersistenceFailed,
        },
        isAuthenticated: true,
    })
    .put("/", ({ user, body }) => PostService.updatePostsMe(body, user.uid), {
        body: PostModel.updatePostBody,
        response: {
            201: PostModel.postBody,
            403: PostModel.errorUnauthorizedAction,
            404: PostModel.errorPostNotFound,
        },
        isAuthenticated: true,
    })
    .delete(
        "/:id",
        async ({ params, user }) => PostService.deletePostsMe(params, user.uid),
        {
            params: PostModel.postIdQuery,
            hasRole: UserRole.Provider,
        },
    );
