import { status } from 'elysia';
import { ReviewsModel } from './model';
import { UserQueries } from '../user/queries';
import { ReviewsQueries } from './queries';
import { AuthQueries } from '../auth/queries';

export abstract class ReviewsService {
    static async publish(
        body: ReviewsModel['publishReviewBody'],
        reviewer_uid: string
    ): Promise<ReviewsModel['publishReviewResponse']> {
        const reviewer = AuthQueries.findByFirebaseUid.get({ $firebase_uid: reviewer_uid });
        if (!reviewer) throw status(404, 'User not found' satisfies ReviewsModel['userNotFound']);

        if (reviewer.id === body.reviewed_id)
            throw status(400, 'You cannot review yourself' satisfies ReviewsModel['forbidden']);

        const existing = ReviewsQueries.findExisting.get({
            $reviewer_id: reviewer.id,
            $reviewed_id: body.reviewed_id,
        });
        if (existing)
            throw status(
                400,
                'You already reviewed this user' satisfies ReviewsModel['alreadyExists']
            );

        const { lastInsertRowid } = ReviewsQueries.insert.run({
            $content: body.content,
            $rating: body.rating,
            $reviewer_id: reviewer.id,
            $reviewed_id: body.reviewed_id,
        });

        const review = ReviewsQueries.findById.get({ $id: Number(lastInsertRowid) });
        if (!review) throw status(500, 'Error creating review');

        return review;
    }

    static async deleteById({
        id,
    }: ReviewsModel['reviewIdParam']): Promise<ReviewsModel['getReviewByIdResponse']> {
        const existing = await ReviewsService.getById({ id });

        ReviewsQueries.delete.run({ $id: Number(id) });

        return existing;
    }

    static async deleteByUid(
        { id }: ReviewsModel['reviewIdParam'],
        uid: string
    ): Promise<ReviewsModel['getReviewByIdResponse']> {
        const existing = await ReviewsService.getById({ id });

        const reviewer = AuthQueries.findByFirebaseUid.get({ $firebase_uid: uid });
        if (!reviewer) throw status(404, 'User not found' satisfies ReviewsModel['userNotFound']);

        if (existing.reviewer_id !== reviewer.id)
            throw status(
                403,
                'You can only delete your own reviews' satisfies ReviewsModel['forbiddenNotOwner']
            );

        ReviewsQueries.delete.run({ $id: Number(id) });

        return existing;
    }

    static async getById({
        id,
    }: ReviewsModel['reviewIdParam']): Promise<ReviewsModel['getReviewByIdResponse']> {
        const review = ReviewsQueries.findById.get({ $id: Number(id) });
        if (!review) throw status(404, 'Review not found' satisfies ReviewsModel['notFound']);

        return review;
    }

    static async getByClientId({
        client_id,
    }: ReviewsModel['clientIdParam']): Promise<ReviewsModel['getReviewByClientIdResponse']> {
        const user = UserQueries.findById.get({ $id: Number(client_id) });
        if (!user) throw status(404, 'User not found' satisfies ReviewsModel['userNotFound']);

        return ReviewsQueries.findByReviewerId.all({ $reviewer_id: Number(client_id) });
    }

    static async getByProviderId({
        provider_id,
    }: ReviewsModel['providerIdParam']): Promise<ReviewsModel['getReviewByProviderIdResponse']> {
        const user = UserQueries.findById.get({ $id: Number(provider_id) });
        if (!user) throw status(404, 'User not found' satisfies ReviewsModel['userNotFound']);

        return ReviewsQueries.findByReviewedId.all({ $reviewed_id: Number(provider_id) });
    }
}
