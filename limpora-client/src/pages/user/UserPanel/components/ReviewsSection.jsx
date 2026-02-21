import lang from '../../../../utils/LangManager';
import ReviewCard from './cards/ReviewCard';

export default function ReviewsSection({
    userReviews,
    canReview,
    reviewContent,
    setReviewContent,
    reviewRating,
    setReviewRating,
    reviewSubmitting,
    reviewSuccess,
    reviewError,
    onSubmit,
}) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-light text-gray-700 pb-2 border-b border-gray-200">
                    {lang('userpanel.title.reviews')}
                </h2>

                {userReviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {userReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 mt-4">No hay reseñas aún.</p>
                )}
            </div>

            {canReview && (
                <div className="pt-4 border-t border-gray-200 space-y-4">
                    <h3 className="text-lg font-light text-gray-700">Dejar una reseña</h3>

                    {reviewSuccess && (
                        <p className="text-green-600 text-sm">¡Reseña enviada correctamente!</p>
                    )}
                    {reviewError && (
                        <p className="text-red-500 text-sm">{reviewError}</p>
                    )}

                    <form onSubmit={onSubmit} className="space-y-3">
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewRating(star)}
                                    className={`text-2xl transition-colors ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={reviewContent}
                            onChange={(e) => setReviewContent(e.target.value)}
                            required
                            placeholder="Escribe tu reseña..."
                            rows={3}
                            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-300 transition resize-none"
                        />

                        <button
                            type="submit"
                            disabled={reviewSubmitting}
                            className="px-5 py-2 bg-gray-100 text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-200 transition disabled:opacity-50"
                        >
                            {reviewSubmitting ? 'Enviando...' : 'Enviar reseña'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}