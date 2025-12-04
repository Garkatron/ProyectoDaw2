import  { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import logo from '../assets/logo-provisional.png'


// Datos de simulación para el Top de Usuarios
const topUsersData = [
    { id: 1, rank: 1, name: 'Alex M.', score: 9540, avatar: 'bg-yellow-200/50' }, // Oro
    { id: 2, rank: 2, name: 'Beatriz R.', score: 9120, avatar: 'bg-gray-200/50' },  // Plata
    { id: 3, rank: 3, name: 'Carlos S.', score: 8890, avatar: 'bg-orange-200/50' }, // Bronce
    { id: 4, rank: 4, name: 'Diana P.', score: 8550, avatar: 'bg-pink-100' },
    { id: 5, rank: 5, name: 'Emilio V.', score: 8200, avatar: 'bg-indigo-100' },
    { id: 6, rank: 6, name: 'Franco L.', score: 7900, avatar: 'bg-red-100' },
];

// --- Componente: Podio (Visualmente distinto para el Top 3) ---
const Podium = ({ topUsers, selectedUser, onClick }) => {
    // Tomamos solo los 3 primeros
    const podiumUsers = topUsers.slice(0, 3);

    return (
        <div className="flex justify-between items-end mb-6 pt-4 px-2">
            {podiumUsers.map((user) => (
                <div
                    key={user.id}
                    onClick={() => onClick(user)}
                    className={`flex flex-col items-center cursor-pointer transition-transform duration-20 ${
                        selectedUser && selectedUser.id === user.id ? 'scale-110' : 'hover:scale-105'
                    }`}
                >
                    {/* Contenedor del Avatar y Medalla */}
                    <div className="relative">
                        <div 
                            // Altura variable para el podio (1: el más alto)
                            style={{ height: user.rank === 1 ? '70px' : (user.rank === 2 ? '55px' : '40px') }}
                            className={`w-16 rounded-t-lg shadow-inner ${user.rank === 1 ? 'bg-yellow-400' : (user.rank === 2 ? 'bg-gray-400' : 'bg-orange-400')}`}
                        ></div>
                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-full border-2 border-white absolute top-[-20px] left-1/2 transform -translate-x-1/2 flex items-center justify-center font-bold text-gray-800 text-lg ${user.avatar}`}>
                            {user.name[0]}
                        </div>
                    </div>
                    
                    {/* Nombre y Puntuación */}
                    <p className="text-sm font-medium text-gray-800 mt-1">{user.name.split(' ')[0]}</p>
                    <span className="text-xs font-semibold text-gray-500">{user.score}</span>
                </div>
            ))}
        </div>
    );
};


// --- Componente auxiliar: Ítem individual de la lista de Top (Para rank 4+) ---
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
        <span className="text-xs font-semibold text-gray-600">{user.score}</span>
    </div>
);

// --- Componente auxiliar: Card de Métrica ---
const MetricCard = ({ label, value }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-300/20 shadow-sm">
        <p className="text-xs font-light text-gray-500 uppercase">{label}</p>
        <p className="text-xl font-semibold text-gray-800">{value}</p>
    </div>
);

// --- Componente: Panel de Detalles del Usuario (Columna Derecha) ---
const UserDetailPanel = ({ user }) => {
    if (!user) {
        // Esto ya no debería ocurrir si inicializamos selectedUser
        return null;
    }

    return (
        // Se mantiene la implementación anterior
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300/20 h-full space-y-6">
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-100">
                <div className={`w-16 h-16 rounded-full ${user.avatar} flex items-center justify-center text-3xl font-bold text-gray-700`}>
                    {user.name[0]}
                </div>
                <div>
                    <h2 className="text-3xl font-light text-gray-800">{user.name}</h2>
                    <p className="text-sm text-gray-500">Rank #{user.rank}</p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-medium text-gray-700">Métricas Principales</h3>
                <div className="grid grid-cols-2 gap-4">
                    <MetricCard label="Puntuación Total" value={user.score} />
                    <MetricCard label="Citas Publicadas" value={145} />
                    <MetricCard label="Reseñas (Avg.)" value="4.8/5" />
                    <MetricCard label="Antigüedad" value="2 años" />
                </div>
            </div>
        </div>
    );
};


// --- Componente Principal: TopUsers ---
export function TopUsers({ }) {
    // Inicializa el estado para el usuario seleccionado, seleccionando el Rank #1 por defecto
    const [selectedUser, setSelectedUser] = useState(topUsersData[0]);
    // Obtenemos los usuarios que están debajo del podio (Rank 4 en adelante)
    const listUsers = topUsersData.slice(3);

    return (
        <div> 
            <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-8">
                
                {/* Header Superior */}
                <header className="bg-white p-6 rounded-lg shadow-md border border-gray-300/20 flex justify-center flex-shrink-0">
                    <div className="flex items-center">
                        <img
                            src={logo}
                            alt="provisional"
                            className="w-32 h-32 object-contain flex-shrink-0"
                        />
                        <h1 className="text-3xl font-light text-gray-800">Top de Usuarios</h1>
                    </div>
                </header>

                {/* Navbar */}
                <Navbar />

                {/* Contenido principal: Grid de 3 columnas */}
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Columna Izquierda: Ranking (Podio + Lista) */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-300/20">
                        
                        <div className="mb-4 bg-gray-100 p-3 rounded-md border border-gray-300/20 shadow-sm">
                            <h2 className="text-xl font-light text-gray-800 text-center">🏆 Ranking Global</h2>
                        </div>
                        
                        {/* 1. SECCIÓN DEL PODIO (TOP 3) */}
                        <Podium 
                            topUsers={topUsersData} 
                            selectedUser={selectedUser} 
                            onClick={setSelectedUser} 
                        />
                        
                        {/* Separador sutil */}
                        <hr className="my-4 border-gray-100" />

                        {/* 2. LISTA DE SEGUIMIENTO (RANK 4+) */}
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
                    </div>

                    {/* Columna Derecha: Detalles del Usuario Seleccionado (No cambia) */}
                    <div className="lg:col-span-2">
                        <UserDetailPanel user={selectedUser} />
                    </div>
                </main>
            </div>
        </div>
    );
}