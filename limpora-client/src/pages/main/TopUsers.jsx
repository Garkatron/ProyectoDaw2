import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Base from '../../layouts/Base';
import logo from '../../assets/logo-provisional.png';
import lang from '../../utils/LangManager';
import { getTopUsers } from '../../services/ranking.service';

const Podium = ({ topUsers, selectedUser, onClick }) => {
    if (!topUsers || topUsers.length < 3) return null;
    
    const podiumUsers = topUsers.slice(0, 3);
    const orderedUsers = [podiumUsers[1], podiumUsers[0], podiumUsers[2]];

    return (
        <div className="flex justify-center items-end mb-6 pt-4 px-2 gap-4">
            {orderedUsers.map((user) => (
                <div
                    key={user.id}
                    onClick={() => onClick(user)}
                    className={`flex flex-col items-center cursor-pointer transition-transform duration-200 ${
                        selectedUser && selectedUser.id === user.id ? 'scale-110' : 'hover:scale-105'
                    }`}
                >
                    <div className="relative">
                        <div 
                            style={{ height: user.rank === 1 ? '70px' : (user.rank === 2 ? '55px' : '40px') }}
                            className={`w-16 rounded-t-lg shadow-inner ${user.rank === 1 ? 'bg-yellow-400' : (user.rank === 2 ? 'bg-gray-400' : 'bg-orange-400')}`}
                        ></div>
                        <div className={`w-12 h-12 rounded-full border-2 border-white absolute top-[-20px] left-1/2 transform -translate-x-1/2 flex items-center justify-center font-bold text-gray-800 text-lg ${
                            user.rank === 1 ? 'bg-yellow-200/50' : (user.rank === 2 ? 'bg-gray-200/50' : 'bg-orange-200/50')
                        }`}>
                            {user.name[0].toUpperCase()}
                        </div>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-800 mt-1">{user.name.split(' ')[0]}</p>
                    <span className="text-xs font-semibold text-gray-500">{user.total_points}</span>
                </div>
            ))}
        </div>
    );
};

const UserListItem = ({ user, isSelected, onClick }) => (
    <div
        className={`p-3 rounded-lg shadow-sm border border-gray-300/20 transition-all cursor-pointer flex items-center justify-between
          ${isSelected ? 'bg-gray-200 shadow-md' : 'bg-white hover:bg-gray-100'}`}
        onClick={() => onClick(user)}
    >
        <div className="flex items-center space-x-3">
            <span className="w-5 text-center text-sm font-bold text-gray-700">{user.rank}</span>
            <p className="text-sm font-medium text-gray-800">{user.name}</p>
        </div>
        <span className="text-xs font-semibold text-gray-600">{user.total_points}</span>
    </div>
);

const MetricCard = ({ label, value }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-300/20 shadow-sm">
        <p className="text-xs font-light text-gray-500 uppercase">{label}</p>
        <p className="text-xl font-semibold text-gray-800">{value}</p>
    </div>
);

const UserDetailPanel = ({ user, onNavigate }) => {
    if (!user) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300/20 h-full flex items-center justify-center">
                <p className="text-gray-500">Selecciona un usuario para ver sus detalles</p>
            </div>
        );
    }

    const getAvatarColor = (rank) => {
        if (rank === 1) return 'bg-yellow-200/50';
        if (rank === 2) return 'bg-gray-200/50';
        if (rank === 3) return 'bg-orange-200/50';
        return 'bg-blue-100';
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300/20 h-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-full ${getAvatarColor(user.rank)} flex items-center justify-center text-3xl font-bold text-gray-700`}>
                        {user.name[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-3xl font-light text-gray-800">{user.name}</h2>
                        <p className="text-sm text-gray-500">Rank #{user.rank}</p>
                    </div>
                </div>
                <button
                    onClick={() => onNavigate(user.name)}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                    Ver Perfil
                </button>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-medium text-gray-700">Métricas Principales</h3>
                <div className="grid grid-cols-2 gap-4">
                    <MetricCard label="Puntuación Total" value={user.total_points || 0} />
                    <MetricCard label="Citas Completadas" value={user.completed_appointments || 0} />
                    <MetricCard label="Reseñas (Avg.)" value={`${(user.avg_rating || 0).toFixed(1)}/5`} />
                    <MetricCard label="Antigüedad" value={`${user.member_years || 0} años`} />
                </div>
            </div>
        </div>
    );
};

export default function TopUsers() {
    const [topUsers, setTopUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTopUsers = async () => {
            try {
                setLoading(true);
                const users = await getTopUsers(10);
                setTopUsers(users);
                if (users.length > 0) {
                    setSelectedUser(users[0]);
                }
            } catch (err) {
                console.error('Error fetching top users:', err);
                setError('Error al cargar el ranking');
            } finally {
                setLoading(false);
            }
        };

        fetchTopUsers();
    }, []);

    const handleNavigateToProfile = (username) => {
        navigate(`/user/${username}`);
    };

    if (loading) {
        return (
            <Base>
                <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-8">
                    <p className="text-gray-500 text-center">Cargando ranking...</p>
                </div>
            </Base>
        );
    }

    if (error) {
        return (
            <Base>
                <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-8">
                    <p className="text-red-500 text-center">{error}</p>
                </div>
            </Base>
        );
    }

    if (topUsers.length === 0) {
        return (
            <Base>
                <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-8">
                    <p className="text-gray-500 text-center">No hay usuarios en el ranking aún</p>
                </div>
            </Base>
        );
    }

    const listUsers = topUsers.slice(3);

    return (
        <Base>
            <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-8">
                <header className="bg-white p-6 rounded-lg shadow-md border border-gray-300/20 flex justify-center flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <img
                            src={logo}
                            alt="Logo"
                            className="w-32 h-32 object-contain flex-shrink-0"
                        />
                        <h1 className="text-3xl font-light text-gray-800">{lang("topusers.title") || "Top Usuarios"}</h1>
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-300/20">
                        <div className="mb-4 bg-gray-100 p-3 rounded-md border border-gray-300/20 shadow-sm">
                            <h2 className="text-xl font-light text-gray-800 text-center">🏆 {lang("topusers.title.ranking") || "Ranking"}</h2>
                        </div>
                        
                        <Podium 
                            topUsers={topUsers} 
                            selectedUser={selectedUser} 
                            onClick={setSelectedUser} 
                        />
                        
                        {listUsers.length > 0 && (
                            <>
                                <hr className="my-4 border-gray-100" />
                                <div className="mb-4 bg-gray-100 p-3 rounded-md border border-gray-300/20 shadow-sm">
                                    <h3 className="text-base font-light text-gray-700 text-center">Otros Rankeados</h3>
                                </div>
                                <div className="space-y-3">
                                    {listUsers.map(user => (
                                        <UserListItem
                                            key={user.id}
                                            user={user}
                                            isSelected={selectedUser && selectedUser.id === user.id}
                                            onClick={setSelectedUser} 
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <UserDetailPanel 
                            user={selectedUser} 
                            onNavigate={handleNavigateToProfile}
                        />
                    </div>
                </main>
            </div>
        </Base>
    );
}