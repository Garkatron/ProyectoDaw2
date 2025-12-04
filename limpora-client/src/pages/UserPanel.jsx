import Base from '../layouts/Base';
import { TrophyIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import lang from '../utils/LangManager';

const userData = {
    name: 'Nombre Apellidos',
    email: 'email@ejemplo.com',
    birthDate: '01/01/1990',
    accountCreated: '05/Abr/2023',
    citasCompletas: 42,
    puntosTotales: 1850,
    avatarColor: 'bg-indigo-100',
    coverImageUrl: 'https://media.istockphoto.com/id/1360927961/es/foto/fondo-abstracto-con-entrelazamiento-de-l%C3%ADneas-y-puntos-de-colores-estructura-de-conexi%C3%B3n-de.jpg?s=612x612&w=0&k=20&c=fQMuV5lCMxs3u3FZV2Vzhm--XxJGI5uUjMDj5o1SpG8=', 
};

const userReviews = [
    { id: 1, reviewer: 'Alex M.', rating: 5, avatarColor: 'bg-green-100', text: "¡Excelente experiencia! Muy profesional y puntual, lo recomiendo al 100%." },
    { id: 2, reviewer: 'Beatriz R.', rating: 4, avatarColor: 'bg-blue-100', text: "Buen servicio, aunque tardó un poco en responder los mensajes iniciales." },
    { id: 3, reviewer: 'Carlos S.', rating: 5, avatarColor: 'bg-yellow-100', text: "Simplemente el mejor. Superó mis expectativas en todos los aspectos. ⭐⭐⭐⭐⭐" },
    { id: 4, reviewer: 'Diana P.', rating: 3, avatarColor: 'bg-pink-100', text: "El trabajo fue correcto, pero el trato podría ser más amable la próxima vez." },
    { id: 5, reviewer: 'Emilio V.', rating: 5, avatarColor: 'bg-indigo-100', text: "Rápido y eficiente. Volveré a usar sus servicios sin duda." },
    { id: 6, reviewer: 'Franco L.', rating: 4, avatarColor: 'bg-red-100', text: "Cumplió con todo lo pactado. Un pequeño detalle a mejorar, pero muy bien en general." },
];

const InfoCard = ({ label, value }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-300/20">
        <p className="text-xs font-light text-gray-500 uppercase">{label}</p>
        <p className="text-base font-medium text-gray-800">{value}</p>
    </div>
);

const ReviewCard = ({ review }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-300/20 space-y-2">
        <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full ${review.avatarColor} flex items-center justify-center text-sm font-bold text-gray-700 flex-shrink-0`}>
                {review.reviewer[0]}
            </div>
            <div className="flex-grow flex justify-between items-center">
                <p className="text-sm font-medium text-gray-800">{review.reviewer}</p>
                <p className="text-sm text-yellow-500 flex-shrink-0">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </p>
            </div>
        </div>
        <p className="text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3 pt-1">
            "{review.text}"
        </p>
    </div>
);

const MetricPill = ({ icon: Icon, label, value, color }) => (
    <div className={`flex items-center space-x-2 p-3 rounded-full ${color} shadow-sm border border-gray-300/20`}>
        <Icon className="h-6 w-6 text-gray-500" />
        <p className="text-sm font-medium text-gray-700">
            {label}: <span className="font-semibold">{value}</span>
        </p>
    </div>
);


export function UserPanel({}) {
    return (
        <Base>
            <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-8">

                <main className="bg-white rounded-lg shadow-xl border border-gray-300/20">
                    
                    <div className="relative">
                        <div 
                            className="h-60 w-full bg-cover bg-center rounded-t-lg"
                            style={{ backgroundImage: `url(${userData.coverImageUrl})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-t-lg"></div>
                        </div>

                        <div className="absolute left-8 -bottom-12">
                            <div 
                                className={`w-32 h-32 rounded-full ${userData.avatarColor} border-4 border-white shadow-xl flex items-center justify-center text-5xl font-bold text-gray-700`}
                            >
                                {userData.name[0]}
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-8 pt-15 space-y-8"> 
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-6 border-b border-gray-100">
                            
                            <div className="lg:col-span-1 flex flex-col justify-start pt-4">
                                <h1 className="text-2xl font-semibold text-gray-800">{userData.name}</h1>
                                <p className="text-sm text-gray-500">{lang("userpanel.p.membersince")} {userData.accountCreated}</p>
                            </div>

                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoCard label={lang("userpanel.label.birthdate")} value={userData.birthDate} />
                                <InfoCard label={lang("userpanel.label.email")} value={userData.email} />
                            </div>
                        </div>
                        
                        <div className="flex space-x-6 items-center border-b border-gray-100 pb-6">
                            <MetricPill 
                                icon={CalendarDaysIcon} 
                                label={lang("userpanel.label.completed_appointments")} 
                                value={userData.citasCompletas} 
                                color="bg-gray-100"
                            />
                             <MetricPill 
                                icon={TrophyIcon} 
                                label={lang("userpanel.label.total_points")}
                                value={userData.puntosTotales} 
                                color="bg-gray-100"
                            />
                        </div>
                        
                        <div className="space-y-4">
                            <h2 className="text-2xl font-light text-gray-800 pb-2 border-b border-gray-100">{lang("userpanel.title.reviews")}</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {userReviews.map(review => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </Base>
    );
}