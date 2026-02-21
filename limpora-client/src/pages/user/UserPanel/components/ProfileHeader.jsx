import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function ProfileHeader({ targetUser, isSelf, onLogout }) {
    return (
        <div className="relative">
            <div
                className="h-60 w-full bg-cover bg-center rounded-t-lg"
                style={{
                    backgroundImage: `url(https://media.istockphoto.com/id/1360927961/es/foto/fondo-abstracto-con-entrelazamiento-de-l%C3%ADneas-y-puntos-de-colores-estructura-de-conexi%C3%B3n-de.jpg?s=612x612&w=0&k=20&c=fQMuV5lCMxs3u3FZV2Vzhm--XxJGI5uUjMDj5o1SpG8=)`,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-t-lg" />
            </div>

            <div className="absolute left-8 -bottom-12">
                <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-xl flex items-center justify-center text-5xl font-bold text-gray-700">
                    {targetUser.name[0].toUpperCase()}
                </div>
            </div>

            {isSelf && (
                <div className="absolute top-4 right-4">
                    <button
                        onClick={onLogout}
                        className="flex items-center space-x-2 px-4 py-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg shadow-md transition-all duration-200 border border-gray-300/20"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
}