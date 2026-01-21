import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Base from "../../layouts/Base";
import { TrophyIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import lang from "../../utils/LangManager";
import { useAuthStore } from "../../stores/auth.store";

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
          {"★".repeat(review.rating)}
          {"☆".repeat(5 - review.rating)}
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
  const currentUser = useAuthStore((state) => state.user);
  const [targetUser, setTargetUser] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!username || username === "undefined") {
        setError("Invalid username.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const isSelf = username === "me";
        let effectiveUser = currentUser;

        if (isSelf) {
          if (!effectiveUser) {
            try {
              effectiveUser = await getCurrentUser();
              useAuthStore
                .getState()
                .set({ user: effectiveUser, isAuthenticated: true });
            } catch {
              setError("No current user found.");
              return;
            }
          }

          if (effectiveUser.role === "admin") {
            setError("Admins cannot access the panel.");
            return;
          }
        }

        const fetchedUser = isSelf
          ? await getUserByUid(effectiveUser.uid)
          : await getUserByName(username);

        if (fetchedUser.role === "admin") {
          setError("Admin profiles are not visible.");
          return;
        }

        setTargetUser(fetchedUser);

        const reviewsData = (await getReviewsByUsername(fetchedUser.name)).map(
          (r) => ({
            id: r.id,
            reviewer: r.reviewer,
            rating: r.rating,
            text: r.text,
          }),
        );

        setUserReviews(reviewsData);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, currentUser]);

  if (loading) {
    return (
      <Base>
        <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-8">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </Base>
    );
  }

  if (error || !targetUser) {
    return (
      <Base>
        <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-8">
          <p className="text-red-500">{error || "User not found."}</p>
        </div>
      </Base>
    );
  }

  const isSelf = username === "me";

  return (
    <Base>
      <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-8">
        <main className="bg-white rounded-lg shadow-xl border border-gray-300/20">
          {/* Header y Avatar */}
          <div className="relative">
            <div
              className="h-60 w-full bg-cover bg-center rounded-t-lg"
              style={{
                backgroundImage: `ur[](https://media.istockphoto.com/id/1360927961/es/foto/fondo-abstracto-con-entrelazamiento-de-l%C3%ADneas-y-puntos-de-colores-estructura-de-conexi%C3%B3n-de.jpg?s=612x612&w=0&k=20&c=fQMuV5lCMxs3u3FZV2Vzhm--XxJGI5uUjMDj5o1SpG8=)`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-t-lg"></div>
            </div>
            <div className="absolute left-8 -bottom-12">
              <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-xl flex items-center justify-center text-5xl font-bold text-gray-700">
                {targetUser.name[0].toUpperCase()}
              </div>
            </div>
          </div>

          {/* Info del usuario */}
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
                    label={lang("userpanel.label.email")}
                    value={targetUser.email}
                  />
                )}
                <InfoCard
                  label={lang("userpanel.label.role")}
                  value={targetUser.role}
                />
              </div>
            </div>

            {/* Métricas */}
            <div className="flex space-x-6 items-center border-b border-gray-100 pb-6">
              <MetricPill
                icon={CalendarDaysIcon}
                label={lang("userpanel.label.completed_appointments")}
                value={targetUser.citasCompletas || 0}
                color="bg-gray-100"
              />
              <MetricPill
                icon={TrophyIcon}
                label={lang("userpanel.label.total_points")}
                value={targetUser.puntosTotales || 0}
                color="bg-gray-100"
              />
            </div>

            {/* Reviews */}
            <div className="space-y-4">
              <h2 className="text-2xl font-light text-gray-800 pb-2 border-b border-gray-100">
                {lang("userpanel.title.reviews")}
              </h2>

              {userReviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 col-span-2">No hay reviews aún.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </Base>
  );
}
