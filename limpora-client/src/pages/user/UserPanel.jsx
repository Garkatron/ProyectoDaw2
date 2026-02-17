import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Base from '../../layouts/Base';
import {
    TrophyIcon,
    CalendarDaysIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import lang from '../../utils/LangManager';
import { useAuthStore } from '../../stores/auth.store';
import { getUserByName, getUserByUid } from '../../services/user.service';
import { getReviewsByUsername, addReview } from '../../services/reviews.service';

const InfoCard = ({ label, value }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-300/20">
        <p className="text-xs font-light text-gray-500 uppercase">{label}</p>
        <p className="text-base font-medium text-gray-800">{value}</p>
    </div>
);

const ReviewCard = ({ review }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-300/20 space-y-2">
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-700 flex-shrink-0">
                {review.reviewer[0].toUpperCase()}
            </div>
            <div className="flex-grow flex justify-between items-center">
                <p className="text-sm font-medium text-gray-800">{review.reviewer}</p>
                <p className="text-sm text-yellow-500 flex-shrink-0">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                </p>
            </div>
        </div>
        <p className="text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3 pt-1">
            "{review.text}"
        </p>
    </div>
);

const MetricPill = ({ icon: Icon, label, value, color }) => (
    <div
        className={`flex items-center space-x-2 p-3 rounded-full ${color} shadow-sm border border-gray-300/20`}
    >
        <Icon className="h-6 w-6 text-gray-500" />
        <p className="text-sm font-medium text-gray-700">
            {label}: <span className="font-semibold">{value}</span>
        </p>
    </div>
);

export default function UserPanel() {
    const { username } = useParams();
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const [targetUser, setTargetUser] = useState(null);
    const [userReviews, setUserReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Review form state
    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState(false);
    const [reviewError, setReviewError] = useState(null);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewSubmitting(true);
        setReviewError(null);

        try {
            await addReview({
                content: reviewContent,
                rating: reviewRating,
                userId: currentUser.id,
                providerId: targetUser.id,
            });
            setReviewSuccess(true);
            setReviewContent('');
            setReviewRating(5);

            // Recargar reseñas
            const updatedReviews = (await getReviewsByUsername(targetUser.name)).map((r) => ({
                id: r.id,
                reviewer: r.reviewer,
                rating: r.rating,
                text: r.text,
            }));
            setUserReviews(updatedReviews);
        } catch (err) {
            console.error('Review error:', err.response?.data || err.message);
            setReviewError(
                err.response?.data?.message ||
                    err.response?.data?.errors?.[0]?.message ||
                    'Error al enviar la reseña.'
            );
        } finally {
            setReviewSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!username || username === 'undefined') {
                setError('Invalid username.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const isSelf = username === 'me';
                let effectiveUser = currentUser;

                if (isSelf) {
                    if (!effectiveUser) {
                        try {
                            effectiveUser = await getCurrentUser();
                            useAuthStore
                                .getState()
                                .set({ user: effectiveUser, isAuthenticated: true });
                        } catch {
                            setError('No current user found.');
                            return;
                        }
                    }
                    if (effectiveUser.role === 'admin') {
                        setError('Admins cannot access the panel.');
                        return;
                    }
                }

                const fetchedUser = isSelf
                    ? await getUserByUid(effectiveUser.uid)
                    : await getUserByName(username);

                if (fetchedUser.role === 'admin') {
                    setError('Admin profiles are not visible.');
                    return;
                }

                setTargetUser(fetchedUser);

const reviewsData = (await getReviewsByUsername(fetchedUser.name)).map((r) => ({
  id: r.id,
  reviewer: r.reviewer ?? r.client_name ?? "Anónimo",
  rating: r.rating,
  text: r.text,
}));

                setUserReviews(reviewsData);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to load user profile.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [username, currentUser]);

    if (loading) {
        return (
            <Base>
                <div className="max-w-6xl mx-auto p-8">
                    <p className="text-gray-500">Cargando...</p>
                </div>
            </Base>
        );
    }

    if (error || !targetUser) {
        return (
            <Base>
                <div className="max-w-6xl mx-auto p-8">
                    <p className="text-red-500">{error || 'User not found.'}</p>
                </div>
            </Base>
        );
    }

    const isSelf = username === 'me';
    const canReview = !isSelf && currentUser?.role === 'client' && targetUser.role === 'provider';

    return (
        <Base>
            <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-8">
                <main className="bg-white rounded-lg shadow-xl border border-gray-300/20">
                    <div className="relative">
                        <div
                            className="h-60 w-full bg-cover bg-center rounded-t-lg"
                            style={{
                                backgroundImage: `url(https://media.istockphoto.com/id/1360927961/es/foto/fondo-abstracto-con-entrelazamiento-de-l%C3%ADneas-y-puntos-de-colores-estructura-de-conexi%C3%B3n-de.jpg?s=612x612&w=0&k=20&c=fQMuV5lCMxs3u3FZV2Vzhm--XxJGI5uUjMDj5o1SpG8=)`,
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-t-lg"></div>
                        </div>
                        <div className="absolute left-8 -bottom-12">
                            <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-xl flex items-center justify-center text-5xl font-bold text-gray-700">
                                {targetUser.name[0].toUpperCase()}
                            </div>
                        </div>
                        {isSelf && (
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-4 py-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg shadow-md transition-all duration-200 border border-gray-300/20"
                                >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                    <span className="text-sm font-medium">Logout</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-8 pt-16 space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-6 border-b border-gray-100">
                            <div className="lg:col-span-1 flex flex-col justify-start pt-4">
                                <h1 className="text-2xl font-semibold text-gray-800">
                                    {targetUser.name}
                                </h1>
                                {isSelf && (
                                    <p className="text-sm text-gray-500">{targetUser.email}</p>
                                )}
                            </div>
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isSelf && (
                                    <InfoCard
                                        label={lang('userpanel.label.email')}
                                        value={targetUser.email}
                                    />
                                )}
                                <InfoCard
                                    label={lang('userpanel.label.role')}
                                    value={targetUser.role}
                                />
                            </div>
                        </div>

                        <div className="flex space-x-6 items-center border-b border-gray-100 pb-6">
                            <MetricPill
                                icon={CalendarDaysIcon}
                                label={lang('userpanel.label.completed_appointments')}
                                value={targetUser.citasCompletas || 0}
                                color="bg-gray-100"
                            />
                            <MetricPill
                                icon={TrophyIcon}
                                label={lang('userpanel.label.total_points')}
                                value={targetUser.puntosTotales || 0}
                                color="bg-gray-100"
                            />
                        </div>

                        {/* Reseñas */}
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

                        {/* Formulario de reseña — solo visible para clientes visitando un proveedor */}
                        {canReview && (
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <h2 className="text-xl font-light text-gray-800">
                                    Dejar una reseña
                                </h2>

                                {reviewSuccess && (
                                    <p className="text-green-600 text-sm">
                                        ¡Reseña enviada correctamente!
                                    </p>
                                )}
                                {reviewError && (
                                    <p className="text-red-500 text-sm">{reviewError}</p>
                                )}

                                <form onSubmit={handleReviewSubmit} className="space-y-4">
                                    {/* Estrellas */}
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
                    </div>
                </main>
            </div>
        </Base>
    );
}
