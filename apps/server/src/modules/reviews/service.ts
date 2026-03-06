import { status } from "elysia";
import { ReviewsModel } from "./model";
import { UserQueries } from "../user/queries";
import { ReviewsQueries } from "./queries";
import { AuthQueries } from "../auth/queries";
import { BookingQueries } from "../booking/queries";

export abstract class ReviewsService {
    static async publishMe(
        { appointment_id, content, rating }: ReviewsModel["publishReviewBody"],
        reviewer_uid: string,
    ): Promise<ReviewsModel["getOneResponse"]> {
        const reviewer = AuthQueries.findByFirebaseUid.get({
            firebase_uid: reviewer_uid,
        });
        if (!reviewer)
            throw status(
                404,
                "User not found" satisfies ReviewsModel["userNotFound"],
            );

        const existing = ReviewsQueries.findById.get({ id: appointment_id });

        const appointment = BookingQueries.findById.get({ id: appointment_id });

        if (!appointment) {
            throw status(
                404,
                "Appointment not found" satisfies ReviewsModel["appointmentNotFound"],
            );
        }
        if (reviewer.id === existing?.reviewed_id)
            throw status(
                400,
                "You cannot review yourself" satisfies ReviewsModel["forbidden"],
            );

        if (existing)
            throw status(
                400,
                "You have already reviewed this appointment" satisfies ReviewsModel["alreadyExists"],
            );

        if (appointment.status !== "Completed") {
            throw status(
                400,
                "You can only review completed appointments" satisfies ReviewsModel["forbiddenNotCompleted"],
            );
        }

        const { lastInsertRowid } = ReviewsQueries.insert.run({
            content,
            rating,
            reviewer_id: reviewer.id,
            reviewed_id: appointment.provider_id,
            appointment_id,
        });

        const review = ReviewsQueries.findById.get({
            id: Number(lastInsertRowid),
        });
        if (!review) throw status(500, "Error creating review");

        return review;
    }

    static async deleteById({
        id,
    }: ReviewsModel["reviewIdParam"]): Promise<ReviewsModel["getOneResponse"]> {
        const existing = await ReviewsService.getById({ id });

        ReviewsQueries.delete.run({ id: Number(id) });

        return existing;
    }

    static async getByProvider(provider_id: number) {
        return ReviewsQueries.findByReviewedId.all({
            reviewed_id: provider_id,
        });
    }

    static async delete(id: number, requester_id: number, isAdmin: boolean) {
        const review = ReviewsQueries.findById.get({ id });

        if (!review) throw status(404, "Review not found");

        if (review.reviewer_id !== requester_id && !isAdmin) {
            throw status(
                403,
                "You can only manage your own reviews" satisfies ReviewsModel["forbiddenNotOwner"],
            );
        }

        ReviewsQueries.delete.run({ id });
        return { success: true };
    }

    static async deleteByUid(
        { id }: ReviewsModel["reviewIdParam"],
        uid: string,
    ): Promise<ReviewsModel["getOneResponse"]> {
        const existing = await ReviewsService.getById({ id });

        const reviewer = AuthQueries.findByFirebaseUid.get({
            firebase_uid: uid,
        });
        if (!reviewer)
            throw status(
                404,
                "User not found" satisfies ReviewsModel["userNotFound"],
            );

        if (existing.reviewer_id !== reviewer.id)
            throw status(
                403,
                "You can only manage your own reviews" satisfies ReviewsModel["forbiddenNotOwner"],
            );

        ReviewsQueries.delete.run({ id: Number(id) });

        return existing;
    }

    static async getById({
        id,
    }: ReviewsModel["reviewIdParam"]): Promise<ReviewsModel["getOneResponse"]> {
        const review = ReviewsQueries.findById.get({ id: Number(id) });
        if (!review)
            throw status(
                404,
                "Review not found" satisfies ReviewsModel["notFound"],
            );

        return review;
    }

    static async getByClientId({
        client_id,
    }: ReviewsModel["clientIdParam"]): Promise<ReviewsModel["getAllResponse"]> {
        const user = UserQueries.findById.get({ id: Number(client_id) });
        if (!user)
            throw status(
                404,
                "User not found" satisfies ReviewsModel["userNotFound"],
            );

        return ReviewsQueries.findByReviewerId.all({
            reviewer_id: Number(client_id),
        });
    }

    static async getByAppointmentId({
        appointment_id,
    }: {
        appointment_id: number;
    }) {
        const review = ReviewsQueries.findByAppointmentId.get({
            appointment_id,
        });
        if (!review) throw status(404, "Review not found");
        return review;
    }
}
