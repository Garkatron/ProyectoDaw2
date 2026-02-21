import { TrophyIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import lang from '../../../../utils/LangManager';

const MetricPill = ({ icon: Icon, label, value, color }) => (
    <div className={`flex items-center space-x-2 p-3 rounded-full ${color} shadow-sm border border-gray-300/20`}>
        <Icon className="h-6 w-6 text-gray-500" />
        <p className="text-sm font-medium text-gray-700">
            {label}: <span className="font-semibold">{value}</span>
        </p>
    </div>
);

export default function MetricsBar({ targetUser }) {
    return (
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
    );
}