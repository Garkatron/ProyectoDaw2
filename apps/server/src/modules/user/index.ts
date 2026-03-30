import { Elysia } from "elysia";
import { AuthGuard } from "../auth/guard";
import { UserService } from "./service";
import { UserModel } from "./model";
import { UserQueries } from "./queries";
import { AuthQueries } from "../auth/queries";
import { status } from "elysia";

export const userController = new Elysia({ prefix: "/user" })
  .use(AuthGuard)

  .get("/", async () => UserService.getAllUsers(), {
    body: UserModel.getAllUsers,
    response: {
      200: UserModel.getAllUsers,
      404: UserModel.notFound,
    },
    isAuthenticated: true,
  })

  .get("/me", async ({ user }) => UserService.getMe({ uid: user.uid }), {
    response: {
      200: UserModel.getMe,
      404: UserModel.notFound,
    },
    isAuthenticated: true,
  })

  .get("/id/:id", async ({ params }) => UserService.getById(params), {
    params: UserModel.userIdParam,
    response: {
      200: UserModel.getUserById,
      404: UserModel.notFound,
    },
    isAuthenticated: true,
  })

  .get("/name/:name", async ({ params }) => UserService.getByName(params), {
    params: UserModel.userNameParam,
    response: {
      200: UserModel.getUserByName,
      404: UserModel.notFound,
    },
    isAuthenticated: true,
  })

  .get(
    "/me/provider-profile",
    async ({ user }) => {
      const dbUser = AuthQueries.findByFirebaseUid.get({
        firebase_uid: user.uid,
      });
      if (!dbUser)
        throw status(404, "User not found" satisfies UserModel["notFound"]);
      const profile = UserQueries.getProviderProfile.get({
        user_id: dbUser.id,
      });
      return { travel_buffer_min: profile?.travel_buffer_min ?? 30 };
    },
    {
      response: {
        200: UserModel.providerProfileResponse,
        404: UserModel.notFound,
      },
      isAuthenticated: true,
    },
  )

  .patch(
    "/me/provider-profile",
    async ({ user, body }) => {
      const dbUser = AuthQueries.findByFirebaseUid.get({
        firebase_uid: user.uid,
      });
      if (!dbUser)
        throw status(404, "User not found" satisfies UserModel["notFound"]);
      UserQueries.upsertProviderProfile.run({
        user_id: dbUser.id,
        travel_buffer_min: body.travel_buffer_min,
      });
      return { travel_buffer_min: body.travel_buffer_min };
    },
    {
      body: UserModel.updateProviderProfileBody,
      response: {
        200: UserModel.providerProfileResponse,
        404: UserModel.notFound,
      },
      isAuthenticated: true,
    },
  );
