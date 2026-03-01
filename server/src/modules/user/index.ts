import Elysia from 'elysia';
import { AuthGuard } from '../auth/guard';
import { UserRole } from '../../enums/Role.enum';
import { UserService } from './service';
import { UserModel } from './model';

export const userController = new Elysia({ prefix: '/user' })
    .use(AuthGuard)

    .get('/', async () => UserService.getAllUsers(), {
        response: {
            200: UserModel.getAllUsers,
            404: UserModel.notFound,
        },
        hasRole: UserRole.Admin,
    })
    .get('/id/:id', async ({ params }) => UserService.getById(params), {
        response: {
            200: UserModel.getUserById,
            404: UserModel.notFound,
        },
        isAuthenticated: true,
    })
    .get('(/name/:name', async ({ params }) => UserService.getByName(params), {
        response: {
            200: UserModel.getUserById,
            404: UserModel.notFound,
        },
        isAuthenticated: true,
    });
