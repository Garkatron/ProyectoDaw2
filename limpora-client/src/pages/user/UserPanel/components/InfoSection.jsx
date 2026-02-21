import lang from '../../../../utils/LangManager';
import InfoCard from './cards/InfoCard';

export default function InfoSection({ targetUser }) {
    return (
        <div className="flex flex-col md:flex-row items-center justify-start gap-6 pb-6 border-b border-gray-100">
            <h1 className="text-2xl font-semibold text-gray-800">{targetUser.name}</h1>

            <div className="flex flex-wrap gap-4">
                <InfoCard
                    label={lang('userpanel.label.role')}
                    value={targetUser.role}
                />
                
            </div>
        </div>
    );
}