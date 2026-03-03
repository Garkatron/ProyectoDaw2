import { status } from "elysia";
import { BookingModel } from "./model";
import { BookingQueries } from "./queries";
import { UserService } from "../user/service";
import { ServicesService } from "../services/service";
import { AppointmentStatus, UserRole } from "@limpora/common";
import { AuthQueries } from "../auth/queries";
import { AuthService } from "../auth/service";

export abstract class BookingService {
    static async assign({
        service_id,
        provider_id,
        client_id,
        price,
        date,
        payment_method,
    }: BookingModel["assignBody"]): Promise<BookingModel["assignResponse"]> {
        if (provider_id === client_id)
            throw status(
                403,
                "You cannot contrat yourself" satisfies BookingModel["forbidden"],
            );

        const provider = await UserService.getById({ id: String(provider_id) });
        const client = await UserService.getById({ id: String(client_id) });

        if (provider.role !== UserRole.Provider)
            throw status(
                403,
                "You cannot contrat a non provider user" satisfies BookingModel["forbidden"],
            );

        if (client.role !== UserRole.Client)
            throw status(
                403,
                "You cannot contrat a non provider user" satisfies BookingModel["forbidden"],
            );

        const service = await ServicesService.getById({
            id: String(service_id),
        });

        const conflict = BookingQueries.findConflict.get({
            provider_id,
            date_time: date,
        });

        if (conflict)
            throw status(
                409,
                "Date occupied" satisfies BookingModel["dateOccupied"],
            );

        const app_commission = 20 * 0.2; // TODO

        const { lastInsertRowid } = BookingQueries.insert.run({
            date_time: date,
            status: AppointmentStatus.Pending,
            price,
            app_commission,
            payment_method,
            client_id: client.id,
            provider_id: provider.id,
            service_id: service.id,
        });

        const appointment = BookingQueries.findById.get({
            id: Number(lastInsertRowid),
        });

        if (!appointment) throw new Error("Appointment not found after insert");

        return appointment;
    }

    static async getMe(uid: string): Promise<BookingModel["listResponse"]> {
        const user = AuthQueries.findByFirebaseUid.get({ firebase_uid: uid });

        if (!user)
            throw status(
                404,
                'User not found' satisfies BookingModel["notFound"],
            );

        if (user.role === UserRole.Client) {
            return BookingQueries.findByClientId.all({ id: user.id });
        }

        if (user.role === UserRole.Provider) {
            return BookingQueries.findByProviderId.all({
                provider_id: user.id,
            });
        }

        throw status(
            403,
            'You cannot have appointments' satisfies BookingModel["forbidden"],
        );
    }

    static async updateStatus({
        id,
        status: appointment_status,
    }: BookingModel["updateStatusBody"]): Promise<
        BookingModel["updateResponse"]
    > {
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
        body: BookingModel["assignBody"],
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
        const client = await UserService.getById({ id: client_id });

        if (client.role !== UserRole.Client)
            throw status(
                403,
                "User is not a client" satisfies BookingModel["forbidden"],
            );

        const appointments = BookingQueries.findByClientId.all({
            id: Number(client_id),
        });

        return appointments;
    }
}
