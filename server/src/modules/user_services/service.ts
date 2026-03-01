import { status } from 'elysia';
import { ProviderServicesModel } from './model';
import { ProviderQueries } from './queries';
import type { UserService } from '@limpora/common/types/user'
import { AuthQueries } from '../auth/queries';

interface UserServiceResponse extends Omit<UserService, 'is_active'> {
    is_active: boolean;
}

const transform = (services: UserService[]): UserServiceResponse[] => {
    return services.map((service) => ({
        ...service,
        is_active: service.is_active === 1,
    }));
};

export abstract class ProviderServicesService {

    static async assign(
        { service_id, price }: ProviderServicesModel['assignServiceBody'],
        provider_id: number
    ): Promise<ProviderServicesModel['assignResponse']> {
        const existing = ProviderQueries.findByProviderAndService.get({
            $user_id:    provider_id,
            $service_id: service_id,
        })
        if (existing)
            throw status(400, 'Service already assigned to this provider' satisfies ProviderServicesModel['alreadyExists'])

        ProviderQueries.insert.run({
            $user_id:    provider_id,
            $service_id: service_id,
            $price:      price,
        })

        const assigned = ProviderQueries.findByProviderAndService.get({
            $user_id:    provider_id,
            $service_id: service_id,
        })
        if (!assigned) throw status(500, 'Error assigning service')

        return transform([assigned])[0] 
    }

    static async assignByUid(
        body: ProviderServicesModel['assignServiceBody'],
        provider_uid: string
    ): Promise<ProviderServicesModel['assignResponse']> {
        const provider = AuthQueries.findByFirebaseUid.get({ $firebase_uid: provider_uid })
        if (!provider) throw status(404, 'User not found' satisfies ProviderServicesModel['userNotFound'])

        return await ProviderServicesService.assign(body, provider.id)
    }

    static async unassign(
        { service_id }: ProviderServicesModel['unassingServiceBody'],
        provider_id: number
    ): Promise<ProviderServicesModel['unassignResponse']> {
        const existing = ProviderQueries.findByProviderAndService.get({
            $user_id:    provider_id,
            $service_id: service_id,
        })
        if (!existing) throw status(404, 'Service not found' satisfies ProviderServicesModel['notFound'])

        ProviderQueries.delete.run({
            $user_id:    provider_id,
            $service_id: service_id,
        })

        return transform([existing])[0]
    }

    static async unassignByUid(
        body: ProviderServicesModel['unassingServiceBody'],
        provider_uid: string
    ): Promise<ProviderServicesModel['unassignResponse']> {
        const provider = AuthQueries.findByFirebaseUid.get({ $firebase_uid: provider_uid })
        if (!provider) throw status(404, 'User not found' satisfies ProviderServicesModel['userNotFound'])

        return await ProviderServicesService.unassign(body, provider.id)
    }

    static async getAll(): Promise<ProviderServicesModel['getAllResponse']> {
        return transform(ProviderQueries.getAll.all(null)) 
    }

    static async getByProviderId({
        provider_id,
    }: ProviderServicesModel['providerIdParam']): Promise<ProviderServicesModel['getAllResponse']> {
        const services = ProviderQueries.findByProviderId.all({ $user_id: Number(provider_id) })  // ← .all() no .get()

        return transform(services)
    }

    static async getByProviderAndServiceId({
        provider_id,
        service_id,
    }: ProviderServicesModel['providerAndServiceIdParam']): Promise<ProviderServicesModel['getByProviderIdResponse']> {
        const service = ProviderQueries.findByProviderAndService.get({
            $user_id:    Number(provider_id),
            $service_id: Number(service_id),
        })
        if (!service) throw status(404, 'Service not found' satisfies ProviderServicesModel['notFound'])

        return transform([service])[0] 
    }
}