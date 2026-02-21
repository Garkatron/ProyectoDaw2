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
                    <p className="text-gray-400">Cargando...</p>
                </div>
            </Base>
        );
    if (error || !targetUser)
        return (
            <Base>
                <div className="max-w-6xl mx-auto p-8">
                    <p className="text-red-400">{error || 'Usuario no encontrado.'}</p>
                </div>
            </Base>
        );

    return (
        <Base>
            <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-8">
                <main className="bg-gray-50 rounded-lg border border-gray-200">
                    <ProfileHeader
                        targetUser={targetUser}
                        isSelf={isSelf}
                        onLogout={handleLogout}
                    />

                    <div className="p-6 space-y-6">
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