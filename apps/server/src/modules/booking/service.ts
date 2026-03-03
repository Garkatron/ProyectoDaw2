import { status } from "elysia";
import { BookingModel } from "./model";
import { BookingQueries } from "./queries";
import { UserService } from "../user/service";
import { AppointmentStatus, UserRole } from "@limpora/common";
import { AuthQueries } from "../auth/queries";
import { ProviderQueries } from "../user_services/queries";
import { APP_COMMISSION_PERCENT } from "../../constants";

export abstract class BookingService {
    static async assign({
        service_id,
        provider_id,
        client_id,
        duration_hours,
        start_time,
        payment_method,
    }: BookingModel["assignBody"]): Promise<BookingModel["assignResponse"]> {
        // ? Avoid self contract
        if (provider_id === client_id)
            throw status(
                403,
                "You cannot contract yourself" satisfies BookingModel["forbidden"],
            );

        // ? Find users
        const provider = await UserService.getById({ id: String(provider_id) });
        const client = await UserService.getById({ id: String(client_id) });

        // ? Prevent stupid stuff
        if (provider.role !== UserRole.Provider)
            throw status(
                403,
                "User is not a provider" satisfies BookingModel["forbidden"],
            );

        if (client.role !== UserRole.Client)
            throw status(
                403,
                "User is not a provider" satisfies BookingModel["forbidden"],
            );

        // ? Find service
        const providerService = ProviderQueries.findByProviderAndService.get({
            user_id: provider_id,
            service_id,
        });

        if (!providerService || !providerService.is_active) {
            throw status(
                403,
                "User does not offer this service" satisfies BookingModel["forbidden"],
            );
        }

        // ? Calc time
        const startDate = new Date(start_time);
        const endDate = new Date(
            startDate.getTime() + duration_hours * 60 * 60 * 1000,
        );

        const new_start = startDate.toISOString();
        const new_end = endDate.toISOString();

        const conflict = BookingQueries.findConflict.get({
            provider_id,
            new_start,
            new_end,
        });

        // ? Avoid service time overlaps
        if (conflict)
            throw status(
                409,
                "Provider is not available in this timeframe" satisfies BookingModel["dateOccupied"],
            );

        // ? Economic stuff
        const provider_net = providerService.price_per_h * duration_hours;
        const app_commission = provider_net * APP_COMMISSION_PERCENT;
        const total_price = provider_net + app_commission;

        // ? Insert
        const { lastInsertRowid } = BookingQueries.insert.run({
            start_time: new_start,
            end_time: new_end,
            travel_buffer_min: 30,
            status: AppointmentStatus.Pending,
            total_price,
            provider_net,
            app_commission,
            payment_method,
            client_id,
            provider_id,
            service_id,
        });

        const created = BookingQueries.findById.get({
            id: Number(lastInsertRowid),
        });

        if (!created) {
            throw status(500, "Failed to retrieve the created appointment");
        }

        return created;
    }

    static async getMe(uid: string): Promise<BookingModel["listResponse"]> {
        const user = AuthQueries.findByFirebaseUid.get({ firebase_uid: uid });

        if (!user)
            throw status(
                404,
                "User not found" satisfies BookingModel["notFound"],
            );

        if (user.role === UserRole.Client) {
            return BookingQueries.findByClientId.all({ client_id: user.id });
        }

        if (user.role === UserRole.Provider) {
            return BookingQueries.findByProviderId.all({
                provider_id: user.id,
            });
        }

        throw status(
            403,
            "Admins can't have appointments" satisfies BookingModel["forbidden"],
        );
    }

    static async updateStatus(
        { status: appointment_status }: BookingModel["updateStatusBody"],
        { id }: BookingModel["appointmentIdParam"],
    ): Promise<BookingModel["updateResponse"]> {
        const appointment = BookingQueries.findById.get({ id });

        if (!appointment)
            throw status(
                404,
                "Appointment not found" satisfies BookingModel["notFound"],
            );

        BookingQueries.updateStatus.run({
            id: appointment.id,
            status: appointment_status,
        });

        const updated = BookingQueries.findById.get({
            id: appointment.id,
        });

        if (!updated) throw new Error("Appointment not found after update");

        return updated;
    }

    static async assignByUid(
        body: BookingModel["assignMeBody"],
        client_uid: string,
    ): Promise<BookingModel["assignResponse"]> {
        const client = AuthQueries.findByFirebaseUid.get({
            firebase_uid: client_uid,
        });
        if (!client)
            throw status(
                404,
                "User not found" satisfies BookingModel["notFound"],
            );

        return await BookingService.assign({ ...body, client_id: client.id });
    }

    static async getByProviderId({
        provider_id,
    }: BookingModel["providerIdParam"]): Promise<BookingModel["listResponse"]> {
        const provider = await UserService.getById({ id: String(provider_id) });

        if (provider.role !== UserRole.Provider)
            throw status(
                403,
                "User is not a provider" satisfies BookingModel["forbidden"],
            );

        const appointments = BookingQueries.findByProviderId.all({
            provider_id: Number(provider_id),
        });

        return appointments;
    }

    static async getByClientId({
        client_id,
    }: BookingModel["clientIdParam"]): Promise<BookingModel["listResponse"]> {
        const client = await UserService.getById({ id: String(client_id) });

        if (client.role !== UserRole.Client)
            throw status(
                403,
                "User is not a client" satisfies BookingModel["forbidden"],
            );

        const appointments = BookingQueries.findByClientId.all({
            client_id: Number(client_id),
        });

        return appointments;
    }
}
