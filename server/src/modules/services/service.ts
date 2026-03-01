import { status } from 'elysia';
import { ServicesModel } from './model';
import { ServicesQueries } from './queries';

export abstract class ServicesService {
    static async create({
        name,
        duration,
    }: ServicesModel['createBody']): Promise<ServicesModel['createResponse']> {
        const existing = ServicesQueries.findByName.get({ $name: name });
        if (existing)
            throw status(400, 'Service already exists' satisfies ServicesModel['alreadyExists']);

        const { lastInsertRowid } = ServicesQueries.insert.run({
            $name: name,
            $duration: Number(duration),
        });

        return {
            id: Number(lastInsertRowid),
            name,
            duration,
        };
    }

    static async getAll(): Promise<ServicesModel['getAllResponse']> {
        return ServicesQueries.getAll.all(null);
    }

    static async getById({
        id,
    }: ServicesModel['serviceIdParam']): Promise<ServicesModel['getByIdResponse']> {
        const service = ServicesQueries.findById.get({ $id: Number(id) });

        if (!service) throw status(404, 'Service not found' satisfies ServicesModel['notFound']);

        return service;
    }
}
