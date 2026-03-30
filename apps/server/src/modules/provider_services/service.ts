// ? ProviderServicesService
// ! ------------------------
// * Responsible for managing provider-service relationships.
// * Handles assignment, unassignment, price updates, and activation status.
// * Acts as the application layer between controllers and data queries.

import { status } from "elysia";
import { ProviderServicesModel } from "./model";
import { ProviderQueries } from "./queries";
import { AuthQueries } from "../auth/queries";
import { ServicesQueries } from "../services/queries";
import { ProviderService } from "@limpora/common";

interface UserServiceResponse extends Omit<ProviderService, "is_active"> {
  is_active: boolean;
}

const transform = (services: ProviderService[]): UserServiceResponse[] => {
  return services.map((service) => ({
    ...service,
    is_active: service.is_active === 1,
  }));
};

export abstract class ProviderServicesService {
  static async getProviderByUid(uid: string) {
    const provider = AuthQueries.findByFirebaseUid.get({
      firebase_uid: uid,
    });
    if (!provider) {
      throw status(
        404,
        "User not found" satisfies ProviderServicesModel["userNotFound"],
      );
    }
    return provider;
  }

  static async updatePriceByUid(
    uid: string,
    service_id: number,
    body: ProviderServicesModel["updatePriceBody"],
  ): Promise<ProviderServicesModel["getOneResponse"]> {
    const provider = await this.getProviderByUid(uid);
    return await this.updatePrice(body, {
      provider_id: provider.id,
      service_id,
    });
  }

  static async toggleActiveByUid(
    uid: string,
    service_id: number,
    body: ProviderServicesModel["toggleActiveBody"],
  ): Promise<ProviderServicesModel["getOneResponse"]> {
    const provider = await this.getProviderByUid(uid);
    return await this.toggleActive(body, {
      provider_id: provider.id,
      service_id,
    });
  }

  static async assign(
    {
      service_id,
      price_per_h,
      duration_minutes,
    }: ProviderServicesModel["assignServiceBody"],
    provider_id: number,
  ): Promise<ProviderServicesModel["getOneResponse"]> {
    const service = ServicesQueries.findById.get({ id: service_id });
    if (!service)
      throw status(
        404,
        "Service not found" satisfies ProviderServicesModel["notFound"],
      );

    const existing = ProviderQueries.findByProviderAndService.get({
      user_id: provider_id,
      service_id: service_id,
    });
    if (existing)
      throw status(
        400,
        "Service already assigned to this provider" satisfies ProviderServicesModel["alreadyExists"],
      );

    ProviderQueries.insert.run({
      user_id: provider_id,
      service_id,
      price_per_h,
      duration_minutes,
    });

    const assigned = ProviderQueries.findByProviderAndService.get({
      user_id: provider_id,
      service_id: service_id,
    });
    if (!assigned) throw status(500, "Error assigning service");

    return transform([assigned])[0];
  }

  static async assignByUid(
    body: ProviderServicesModel["assignServiceBody"],
    provider_uid: string,
  ): Promise<ProviderServicesModel["getOneResponse"]> {
    const provider = AuthQueries.findByFirebaseUid.get({
      firebase_uid: provider_uid,
    });
    if (!provider)
      throw status(
        404,
        "User not found" satisfies ProviderServicesModel["userNotFound"],
      );

    return await ProviderServicesService.assign(body, provider.id);
  }

  static async unassign({
    service_id,
    provider_id,
  }: ProviderServicesModel["providerAndServiceIdParam"]): Promise<
    ProviderServicesModel["getOneResponse"]
  > {
    const existing = ProviderQueries.findByProviderAndService.get({
      user_id: provider_id,
      service_id: service_id,
    });
    if (!existing)
      throw status(
        404,
        "Service not found" satisfies ProviderServicesModel["notFound"],
      );

    ProviderQueries.delete.run({
      user_id: provider_id,
      service_id: service_id,
    });

    return transform([existing])[0];
  }

  static async unassignByUid(
    { service_id }: ProviderServicesModel["serviceIdParam"],
    provider_uid: string,
  ): Promise<ProviderServicesModel["getOneResponse"]> {
    const provider = AuthQueries.findByFirebaseUid.get({
      firebase_uid: provider_uid,
    });
    if (!provider)
      throw status(
        404,
        "User not found" satisfies ProviderServicesModel["userNotFound"],
      );

    return await ProviderServicesService.unassign({
      provider_id: provider.id,
      service_id,
    });
  }

  static async getAll(): Promise<ProviderServicesModel["getAllResponse"]> {
    return transform(ProviderQueries.getAll.all(null));
  }

  static async getByProviderId({
    provider_id,
  }: ProviderServicesModel["providerIdParam"]): Promise<
    ProviderServicesModel["getAllResponse"]
  > {
    const services = ProviderQueries.findByProviderId.all({
      user_id: provider_id,
    });

    return transform(services);
  }

  static async updatePrice(
    { price_per_h }: ProviderServicesModel["updatePriceBody"],
    {
      provider_id,
      service_id,
    }: ProviderServicesModel["providerAndServiceIdParam"],
  ): Promise<ProviderServicesModel["getOneResponse"]> {
    const existing = ProviderQueries.findByProviderAndService.get({
      user_id: provider_id,
      service_id: service_id,
    });

    if (!existing) {
      throw status(
        404,
        "Service not found" satisfies ProviderServicesModel["notFound"],
      );
    }

    ProviderQueries.updatePrice.run({
      user_id: provider_id,
      service_id,
      price_per_h,
    });

    const updated = ProviderQueries.findByProviderAndService.get({
      user_id: provider_id,
      service_id,
    });

    return transform([updated!])[0];
  }

  static async toggleActive(
    { is_active }: ProviderServicesModel["toggleActiveBody"],
    {
      provider_id,
      service_id,
    }: ProviderServicesModel["providerAndServiceIdParam"],
  ): Promise<ProviderServicesModel["getOneResponse"]> {
    const existing = ProviderQueries.findByProviderAndService.get({
      user_id: provider_id,
      service_id: service_id,
    });

    if (!existing) {
      throw status(
        404,
        "Service not found" satisfies ProviderServicesModel["notFound"],
      );
    }

    ProviderQueries.toggleActive.run({
      user_id: provider_id,
      service_id,
      is_active: is_active ? 1 : 0,
    });

    const updated = ProviderQueries.findByProviderAndService.get({
      user_id: provider_id,
      service_id,
    });

    return transform([updated!])[0];
  }

  static async getByProviderAndServiceId({
    provider_id,
    service_id,
  }: ProviderServicesModel["providerAndServiceIdParam"]): Promise<
    ProviderServicesModel["getOneResponse"]
  > {
    const service = ProviderQueries.findByProviderAndService.get({
      user_id: Number(provider_id),
      service_id: Number(service_id),
    });
    if (!service)
      throw status(
        404,
        "Service not found" satisfies ProviderServicesModel["notFound"],
      );

    return transform([service])[0];
  }
}
