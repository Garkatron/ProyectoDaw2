import lang from '../../../../utils/LangManager';
import InfoCard from './cards/InfoCard';

export default function InfoSection({ targetUser, isSelf }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-6 border-b border-gray-100">
            <div className="lg:col-span-1 flex flex-col justify-start pt-4">
                <h1 className="text-2xl font-semibold text-gray-800">{targetUser.name}</h1>
                {isSelf && (
                    <p className="text-sm text-gray-500">{targetUser.email}</p>
                )}
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {isSelf && (
                    <InfoCard label={lang('userpanel.label.email')} value={targetUser.email} />
                )}
                <InfoCard label={lang('userpanel.label.role')} value={targetUser.role} />
            </div>
        </div>
    );
}