import { useEffect, useState } from 'react';
import { getReviewsByReviewedId, addReview } from '../../../services/reviews.service';
import { useAuthStore } from '../../../stores/auth.store';

export function useReviews(targetUser, isSelf) {

  const currentUser = useAuthStore((state) => state.user);

  const [userReviews, setUserReviews] = useState([]);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const canReview =
    !isSelf &&
    currentUser?.role === 'client' &&
    targetUser?.role === 'provider';

  useEffect(() => {
    if (!targetUser?.id) return;

    // Reviews RECIBIDAS por el usuario (reviewed)
    getReviewsByReviewedId(targetUser.id).then((data) => {
      setUserReviews(
        data.map((r) => ({
          id: r.id,
          reviewer: r.reviewer_name ?? 'Anónimo',
          rating: r.rating,
          text: r.content,
        }))
      );
    });
  }, [targetUser?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canReview) return;

    setSubmitting(true);
    setError(null);

    try {
      await addReview({
        content: reviewContent,
        rating: reviewRating,
        reviewedId: targetUser.id,
      });

      setSuccess(true);
      setReviewContent('');
      setReviewRating(5);

      // Refresca las reviews recibidas tras añadir una nueva
      const updated = await getReviewsByReviewedId(targetUser.id);
      setUserReviews(
        updated.map((r) => ({
          id: r.id,
          reviewer: r.reviewer_name ?? 'Anónimo',
          rating: r.rating,
          text: r.content,
        }))
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error al enviar la reseña.'
      );
    } finally {
      setSubmitting(false);
    }
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