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
        <>
            <div className="space-y-4">
                <h2 className="text-2xl font-light text-gray-800 pb-2 border-b border-gray-100">
                    {lang('userpanel.title.reviews')}
                </h2>

                {userReviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No hay reviews aún.</p>
                )}
            </div>

            {canReview && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h2 className="text-xl font-light text-gray-800">Dejar una reseña</h2>

                    {reviewSuccess && (
                        <p className="text-green-600 text-sm">¡Reseña enviada correctamente!</p>
                    )}
                    {reviewError && (
                        <p className="text-red-500 text-sm">{reviewError}</p>
                    )}

                    <form onSubmit={onSubmit} className="space-y-4">
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
                            className="w-full p-4 bg-gray-100/50 border border-gray-300/50 rounded-lg shadow-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400/50 transition duration-150 resize-none"
                        />

                        <button
                            type="submit"
                            disabled={reviewSubmitting}
                            className="px-6 py-2 bg-gray-100 text-gray-800 font-medium rounded-lg shadow-sm border border-gray-300/50 hover:bg-gray-200/70 transition duration-150 disabled:opacity-50"
                        >
                            {reviewSubmitting ? 'Enviando...' : 'Enviar reseña'}
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}