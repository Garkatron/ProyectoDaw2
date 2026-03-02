import { useEffect, useState } from "react";
import { useAuthStore } from "../../../stores/auth.store";
import { API } from "../../../lib/api";
import { UserRole } from "@limpora/common";

interface Review {
    id: number;
    reviewer: string;
    rating: number;
    text: string | null;
}

export function useReviews(
    targetUser: { id: number; role: string } | null,
    isSelf: boolean,
) {
    const currentUser = useAuthStore((state) => state.user);

    const [userReviews, setUserReviews] = useState<Review[]>([]);
    const [reviewContent, setReviewContent] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canReview =
        !isSelf &&
        currentUser?.role === UserRole.Client &&
        targetUser?.role === UserRole.Provider;

    const fetchReviews = async (id: number) => {
        const { data, error } = await API.reviews
            .provider({ provider_id: String(id) })
            .get();
        if (error || !data) return;

        setUserReviews(
            data.map((r) => ({
                id: r.id,
                reviewer: "Anónimo", // TODO
                rating: r.rating,
                text: r.content,
            })),
        );
    };

    useEffect(() => {
        if (!targetUser?.id) return;
        fetchReviews(targetUser.id);
    }, [targetUser?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canReview || !targetUser) return;

        setSubmitting(true);
        setError(null);

        const { error } = await API.reviews.publish.post({
            content: reviewContent,
            rating: reviewRating,
            reviewed_id: targetUser.id,
        });

        if (error) {
            setError(
                typeof error.value === "string"
                    ? error.value
                    : "Error al enviar la reseña.",
            );
        } else {
            setSuccess(true);
            setReviewContent("");
            setReviewRating(5);
            await fetchReviews(targetUser.id);
        }

        setSubmitting(false);
    };

    return {
        userReviews,
        canReview,
        reviewContent,
        setReviewContent,
        reviewRating,
        setReviewRating,
        reviewSubmitting: submitting,
        reviewSuccess: success,
        reviewError: error,
        onSubmit: handleSubmit,
    };
}
