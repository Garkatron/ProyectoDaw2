import { Elysia } from 'elysia'
import { AuthGuard } from '../auth/guard'
import { UserRole } from '@limpora/common/src/enums/Role.enum'
import { UserService } from './service'
import { UserModel } from './model'

export const userController = new Elysia({ prefix: '/user' })
    .use(AuthGuard)

    .get('/',
        async () => UserService.getAllUsers(),
        {
            body: UserModel.getAllUsers,
            response: {
                200: UserModel.getAllUsers,
                404: UserModel.notFound,
            },
            isAuthenticated: true
        }
    )

    .get('/me',
        async ({ user }) => UserService.getMe({ uid: user.uid }),
        {
            response: {
                200: UserModel.getMe,
                404: UserModel.notFound,
            },
            isAuthenticated: true,
        }
    )

    .get('/id/:id',
        async ({ params }) => UserService.getById(params),
        {
            params: UserModel.userIdParam,
            response: {
                200: UserModel.getUserById,
                404: UserModel.notFound,
            },
            isAuthenticated: true,
        }
    )

    .get('/name/:name',
        async ({ params }) => UserService.getByName(params),
        {
            params: UserModel.userNameParam,
            response: {
                200: UserModel.getUserByName,
                404: UserModel.notFound,
            },
            isAuthenticated: true,
        }
    )