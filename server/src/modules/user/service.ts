import { status } from 'elysia'
import type { UserModel } from './model'
import { UserQueries } from './queries'

export abstract class UserService {

    static async getAllUsers(): Promise<UserModel['getAllUsers']> {
        return UserQueries.getAll.all(null);
    }

    static async getById({ id }: UserModel['userIdParam']): Promise<UserModel['getUserById']> {
        const user = UserQueries.findById.get({ $id: Number(id) });

        if (!user) throw status(404, 'User not found' satisfies UserModel['notFound']);

        return user;
    }

    static async getByName({ name }: UserModel['userNameParam']): Promise<UserModel['getUserByName']> {
        const user = UserQueries.findByName.get({ $name: name });

        if (!user) throw status(404, 'User not found' satisfies UserModel['notFound']);

        return user;
    }
}