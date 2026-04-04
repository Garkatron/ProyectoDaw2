import { useState } from "react";
import { API } from "../lib/api";

export interface Review {
    id: number;
    reviewer_name: string;
    rating: number;
    content: string | null;
    created_at: string;
}

export function useReviews(targetProviderId?: number) {
    const [userReviews, setUserReviews] = useState<Review[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProviderReviews = async (id: number) => {
        const { data, error } = await API.reviews
            .provider({ provider_id: id })
            .get();
        if (error || !data) return;
        setUserReviews(data as Review[]);
    };

    const handlePublishReview = async (
        appointment_id: number,
        content: string,
        rating: number,
    ) => {
        setSubmitting(true);
        setError(null);

        const { data, error } = await API.reviews.me.post({
            appointment_id,
            content: content || null,
            rating,
        });

        if (error) {
            const msg =
                typeof error.value === "string"
                    ? error.value
                    : "Error al publicar";
            setError(msg);
            setSubmitting(false);
            return { error: msg };
        }

        setSubmitting(false);
        return { data };
    };

    return {
        userReviews,
        fetchProviderReviews,
        handlePublishReview,
        reviewSubmitting: submitting,
        reviewError: error,
        setReviewError: setError,
    };
}
