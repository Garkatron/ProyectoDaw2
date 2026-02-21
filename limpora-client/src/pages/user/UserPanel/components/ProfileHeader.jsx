import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function ProfileHeader({ targetUser, isSelf, onLogout }) {
    return (
        <div className="relative">
            <div
                className="h-56 w-full rounded-t-lg bg-gray-200 flex items-center justify-center text-gray-400 text-lg"
            >
                Fondo de usuario
            </div>

            <div className="absolute left-6 -bottom-10">
                <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-3xl font-bold text-gray-600">
                    {targetUser.name[0].toUpperCase()}
                </div>
            </div>

            {isSelf && (
                <div className="absolute top-4 right-4">
                    <button
                        onClick={onLogout}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 text-sm font-medium transition-colors"
                    >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
}