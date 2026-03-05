// ? BookingService
// ! ------------------------
// * Responsible for managing appointments.
// * Handles assignment, unassignment, status updates and frametime collisions.

import { status } from "elysia";
import { BookingModel } from "./model";
import { BookingQueries } from "./queries";
import { UserService } from "../user/service";
import { AppointmentStatus, UserRole } from "@limpora/common";
import { AuthQueries } from "../auth/queries";
import { ProviderQueries } from "../provider_services/queries";
import { APP_COMMISSION_PERCENT } from "../../constants";
import { db } from "../../libs/db";

export abstract class BookingService {
    static async assign({
        service_id,
        provider_id,
        client_id,
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

        if (provider.role !== UserRole.Provider)
            throw status(
                403,
                "User is not a provider" satisfies BookingModel["forbidden"],
            );

        if (client.role !== UserRole.Client)
            throw status(
                403,
                "User is not a client" satisfies BookingModel["forbidden"],
            );

        // ? Find service
        const providerService = ProviderQueries.findByProviderAndService.get({
            user_id: provider_id,
            service_id,
        });

        if (!providerService || !providerService.is_active)
            throw status(
                403,
                "User does not offer this service" satisfies BookingModel["forbidden"],
            );

        // ? Calc time
        const duration_hours = providerService.duration_hours;
        const startDate = new Date(start_time);
        const endDate = new Date(
            startDate.getTime() + duration_hours * 60 * 60 * 1000,
        );
        const new_start = startDate.toISOString();
        const new_end = endDate.toISOString();

        // ? Validate against ProviderSchedule
        const dayOfWeek = (startDate.getDay() + 6) % 7; // 0=Lunes
        const schedule = BookingQueries.findScheduleByUserAndDay.all({
            user_id: provider_id,
            day_of_week: dayOfWeek,
        });

        if (schedule.length === 0)
            throw status(
                409,
                "Provider is not available in this timeframe" satisfies BookingModel["dateOccupied"],
            );

        const startHHMM = startDate.getHours() * 60 + startDate.getMinutes();
        const endHHMM = endDate.getHours() * 60 + endDate.getMinutes();

        const fitsInSchedule = schedule.some((s) => {
            const [sh, sm] = s.start_time.split(":").map(Number);
            const [eh, em] = s.end_time.split(":").map(Number);
            return startHHMM >= sh * 60 + sm && endHHMM <= eh * 60 + em;
        });

        if (!fitsInSchedule)
            throw status(
                409,
                "Provider is not available in this timeframe" satisfies BookingModel["dateOccupied"],
            );

        // ? Avoid service time overlaps
        const conflict = BookingQueries.findConflict.get({
            provider_id,
            new_start,
            new_end,
        });
        if (conflict)
            throw status(
                409,
                "Provider is not available in this timeframe" satisfies BookingModel["dateOccupied"],
            );

        // ? Economic stuff
        const provider_net = providerService.price_per_h * duration_hours;
        const app_commission = provider_net * APP_COMMISSION_PERCENT;
        const total_price = provider_net + app_commission;

        // ? Travel buffer from provider profile
        const providerProfile = BookingQueries.findProviderProfile.get({
            user_id: provider_id,
        });
        const travel_buffer_min = providerProfile?.travel_buffer_min ?? 30;

        // ? Insert
        const { lastInsertRowid } = BookingQueries.insert.run({
            start_time: new_start,
            end_time: new_end,
            travel_buffer_min,
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
        if (!created)
            throw status(500, "Failed to retrieve the created appointment");

        return created;
    }

    static getAvailability(
        { provider_id }: { provider_id: number },
        { date }: { date: string },
    ): BookingModel["availabilityResponse"] {
        const day_start = `${date}T00:00:00`;
        const day_end = `${date}T23:59:59`;
        const dayOfWeek = (new Date(date).getDay() + 6) % 7; // 0=Lunes

        const schedule = BookingQueries.findScheduleByUserAndDay.all({
            user_id: provider_id,
            day_of_week: dayOfWeek,
        });

        // ? Generate all available slots from provider schedule (every 30min)
        const all_slots = new Set<string>();
        for (const s of schedule) {
            const [sh, sm] = s.start_time.split(":").map(Number);
            const [eh, em] = s.end_time.split(":").map(Number);
            let current = sh * 60 + sm;
            const end = eh * 60 + em;

            while (current < end) {
                const h = String(Math.floor(current / 60)).padStart(2, "0");
                const m = String(current % 60).padStart(2, "0");
                all_slots.add(`${h}:${m}`);
                current += 30;
            }
        }

        // ? Remove slots blocked by appointments + travel buffer
        const rows = BookingQueries.findOccupiedSlots.all({
            provider_id,
            day_start,
            day_end,
        });
        const occupied_slots = new Set<string>();

        for (const row of rows) {
            const start = new Date(row.start_time);
            const end = new Date(row.end_time);
            const bufferEnd = new Date(
                end.getTime() + row.travel_buffer_min * 60_000,
            );

            for (const slot of all_slots) {
                const slotDate = new Date(`${date}T${slot}:00`);
                if (slotDate >= start && slotDate < bufferEnd) {
                    occupied_slots.add(slot);
                }
            }
        }

        return {
            date,
            all_slots: [...all_slots].sort(),
            occupied_slots: [...occupied_slots],
        };
    }

    static getSchedule({
        provider_id,
    }: {
        provider_id: number;
    }): BookingModel["scheduleResponse"] {
        return BookingQueries.findScheduleByUserId.all({
            user_id: provider_id,
        });
    }

    static async upsertSchedule(
        { provider_id }: { provider_id: number },
        slots: BookingModel["upsertScheduleBody"],
        uid: string,
    ): Promise<BookingModel["scheduleResponse"]> {
        const user = await UserService.getMe({ uid });

        if (user.id !== provider_id)
            throw status(
                403,
                "You can only manage your own schedule" satisfies BookingModel["forbidden"],
            );

        // ? Replace full schedule for this provider
        BookingQueries.deleteScheduleByUser.run({ user_id: provider_id });

        for (const slot of slots) {
            BookingQueries.insertSchedule.run({
                user_id: provider_id,
                day_of_week: slot.day_of_week,
                start_time: slot.start_time,
                end_time: slot.end_time,
            });
        }

        return BookingQueries.findScheduleByUserId.all({
            user_id: provider_id,
        });
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

    static async updateStatusMe(
        { status: appointment_status }: BookingModel["updateStatusBody"],
        { id }: BookingModel["appointmentIdParam"],
        uid: string,
    ): Promise<BookingModel["updateResponse"]> {
        const user = await UserService.getMe({ uid });
        const appointment = BookingQueries.findById.get({ id });

        if (!appointment)
            throw status(
                404,
                "Appointment not found" satisfies BookingModel["notFound"],
            );

        if (appointment.provider_id != user.id)
            throw status(
                403,
                "You can only manage your own appointments" satisfies BookingModel["forbidden"],
            );

        // ? Validate status transition
        const VALID_TRANSITIONS: Record<
            AppointmentStatus,
            AppointmentStatus[]
        > = {
            [AppointmentStatus.Pending]: [
                AppointmentStatus.InProcess,
                AppointmentStatus.Cancelled,
            ],
            [AppointmentStatus.InProcess]: [
                AppointmentStatus.Completed,
                AppointmentStatus.Cancelled,
            ],
            [AppointmentStatus.Completed]: [],
            [AppointmentStatus.Cancelled]: [],
        };

        const allowed =
            VALID_TRANSITIONS[appointment.status as AppointmentStatus] ?? [];
        if (!allowed.includes(appointment_status))
            throw status(
                409,
                "Invalid status transition" satisfies BookingModel["invalidTransition"],
            );

        BookingQueries.updateStatus.run({
            id: appointment.id,
            status: appointment_status,
        });

        const updated = BookingQueries.findById.get({ id: appointment.id });
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
