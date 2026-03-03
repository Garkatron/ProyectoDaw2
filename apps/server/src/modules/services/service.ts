import { status } from 'elysia';
import { ServicesModel } from './model';
import { ServicesQueries } from './queries';

export abstract class ServicesService {
    static async create({
        name,
        category,
    }: ServicesModel['createBody']): Promise<ServicesModel['createResponse']> {
        const existing = ServicesQueries.findByName.get({ name });
        if (existing)
            throw status(400, 'Service already exists' satisfies ServicesModel['alreadyExists']);

        const { lastInsertRowid } = ServicesQueries.insert.run({
            name,
            category,
        });

        return {
            id: Number(lastInsertRowid),
            name,
            category,
        };
    }

    static async getAll(): Promise<ServicesModel['getAllResponse']> {
        return ServicesQueries.getAll.all(null);
    }

    static async getById({
        id,
    }: ServicesModel['serviceIdParam']): Promise<ServicesModel['getByIdResponse']> {
        const service = ServicesQueries.findById.get({ id: Number(id) });

        if (!service) throw status(404, 'Service not found' satisfies ServicesModel['notFound']);

        return service;
    }

    static async deleteById({
        id,
    }: ServicesModel['serviceIdParam']): Promise<ServicesModel['getByIdResponse']> {
        const existing = await ServicesService.getById({ id });

        ServicesQueries.delete.run({ id: Number(id) });

        return existing;
    }
}
