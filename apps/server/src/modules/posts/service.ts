import { Post, PostStatus, UserRole } from "@limpora/common";
import { fail } from "../../utils";
import { UserService } from "../user/service";
import { PostModel } from "./model";
import { PostQueries } from "./queries";

export abstract class PostService {
    static async getPost({
        id,
    }: PostModel["postIdQuery"]): Promise<PostModel["postResponse"]> {
        const post = PostQueries.findById.get({ id: Number(id) });

        if (!post) {
            throw fail(
                404,
                "The requested post was not found" satisfies PostModel["errorPostNotFound"],
            );
        }

        return {
            id: post.id,
            title: post.title,
            content: post.content,
        };
    }

    static async getAllPosts(): Promise<PostModel["postResponseAll"]> {
        try {
            const posts = PostQueries.findAll.all(null);

            return posts.map((post: Post) => ({
                id: post.id,
                title: post.title,
                content: post.content,
            }));
        } catch (error) {
            throw fail(
                500,
                "The changes could not be saved to the database. Please try again later" satisfies PostModel["errorPersistenceFailed"],
            );
        }
    }

    private static async validateAdmin(uid: string) {
        const user = await UserService.getMe({ uid });
        if (user.role !== UserRole.Admin) {
            throw fail(
                403,
                "Access denied: Only providers can manage services" satisfies PostModel["errorForbiddenRole"],
            );
        }
        return user;
    }

    static async createPostsMe(
        { title, content }: PostModel["postBody"],
        uid: string,
    ): Promise<PostModel["postResponse"]> {
        const user = await this.validateAdmin(uid);

        const { lastInsertRowid } = PostQueries.create.run({
            title,
            content,
            user_id: user.id,
            status: PostStatus.Published,
        });

        const created = PostQueries.findById.get({
            id: Number(lastInsertRowid),
        });
        if (!created)
            throw fail(
                500,
                "The changes could not be saved to the database. Please try again later" satisfies PostModel["errorPersistenceFailed"],
            );

        return {
            id: created.id,
            title: created.title,
            content: created.content,
        };
    }

    static async updatePostsMe(
        { title, content }: PostModel["postBody"],
        { id }: PostModel["postIdQuery"],
        uid: string,
    ): Promise<PostModel["postResponse"]> {
        const user = await this.validateAdmin(uid);

        const existing = PostQueries.findById.get({ id: Number(id) });

        if (!existing)
            throw fail(
                404,
                "The requested post was not found" satisfies PostModel["errorPostNotFound"],
            );

        PostQueries.update.run({ id: Number(id), title, content });

        const updated = PostQueries.findById.get({ id: Number(id) });
        if (!updated)
            throw fail(
                404,
                "The changes could not be saved to the database. Please try again later" satisfies PostModel["errorPersistenceFailed"],
            );

        return {
            id: updated.id,
            title: updated.title,
            content: updated.content,
        };
    }

    static async deletePostsMe(
        { id }: PostModel["postIdQuery"],
        uid: string,
    ): Promise<PostModel["postResponse"]> {
        const user = await this.validateAdmin(uid);

        const existing = PostQueries.findById.get({ id: Number(id) });

        if (!existing)
            throw fail(
                404,
                "The requested post was not found" satisfies PostModel["errorPostNotFound"],
            );
        if (existing.user_id !== user.id)
            throw fail(
                403,
                "The specified user could not be found in our records" satisfies PostModel["errorUserNotFound"],
            );

        PostQueries.delete.run({ id: Number(id) });

        return {
            id: existing.id,
            title: existing.title,
            content: existing.content,
        };
    }
}
