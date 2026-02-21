
import { useUserPanel } from './useUserPanel';
import { useServices } from './useServices';
import { useReviews } from './useReviews';
import ProfileHeader from './components/ProfileHeader';
import InfoSection from './components/InfoSection';
import MetricsBar from './components/MetricsBar';
import ServicesSection from './components/ServicesSection';
import ReviewsSection from './components/ReviewsSection';
import Base from '../../../layouts/Base';

export default function UserPanel() {
    const { targetUser, isSelf, loading, error, handleLogout } = useUserPanel();
    const services = useServices(targetUser, isSelf);
    const reviews = useReviews(targetUser, isSelf);

    if (loading)
        return (
            <Base>
                <div className="max-w-6xl mx-auto p-8">
                    <p className="text-gray-500">Cargando...</p>
                </div>
            </Base>
        );
    if (error || !targetUser)
        return (
            <Base>
                <div className="max-w-6xl mx-auto p-8">
                    <p className="text-red-500">{error || 'User not found.'}</p>
                </div>
            </Base>
        );

    return (
        <Base>
            <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-8">
                <main className="bg-white rounded-lg shadow-xl border border-gray-300/20">
                    <ProfileHeader
                        targetUser={targetUser}
                        isSelf={isSelf}
                        onLogout={handleLogout}
                    />

                    <div className="p-8 pt-16 space-y-8">
                        <InfoSection targetUser={targetUser} isSelf={isSelf} />
                        <MetricsBar targetUser={targetUser} />

                        {targetUser.role === 'provider' && (
                            <ServicesSection isSelf={isSelf} {...services} />
                        )}

                        <ReviewsSection isSelf={isSelf} {...reviews} />
                    </div>
                </main>
            </div>
        </Base>
    );
}
