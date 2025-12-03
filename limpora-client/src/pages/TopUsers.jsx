import React, { useState } from 'react';
import Base from '../layouts/Base';
import Navbar from '../components/Navbar';
import logo from '../assets/logo-provisional.png'


// Datos de simulación para el Top de Usuarios
const topUsersData = [
    { id: 1, rank: 1, name: 'Alex M.', score: 9540, avatar: 'bg-green-100' },
    { id: 2, rank: 2, name: 'Beatriz R.', score: 9120, avatar: 'bg-blue-100' },
    { id: 3, rank: 3, name: 'Carlos S.', score: 8890, avatar: 'bg-yellow-100' },
    { id: 4, rank: 4, name: 'Diana P.', score: 8550, avatar: 'bg-pink-100' },
    { id: 5, rank: 5, name: 'Emilio V.', score: 8200, avatar: 'bg-indigo-100' },
];

// --- Componente auxiliar: Ítem individual de la lista de Top ---
const UserListItem = ({ user, isSelected, onClick }) => (
    <div
        className={`p-4 rounded-lg shadow-sm border border-gray-300/20 transition-all cursor-pointer flex items-center justify-between
          ${isSelected ? 'bg-gray-200 shadow-md' : 'bg-white hover:bg-gray-100'}`}
        onClick={() => onClick(user)}
    >
        <div className="flex items-center space-x-3">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm 
                ${user.rank <= 3 ? 'text-red-700 bg-red-200' : 'text-gray-700 bg-gray-100/50'}`}>
                {user.rank}
            </span>
            <p className="text-base font-medium text-gray-800">{user.name}</p>
        </div>
        <span className="text-sm font-semibold text-gray-600">{user.score}</span>
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
        return (
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300/20 h-full flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500 text-xl font-light">Selecciona un usuario del Top.</p>
            </div>
        );
    }

    return (
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
                    {/* Datos simulados adicionales */}
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

    return (
        <Base>
            <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-8">

                {/* Header Superior (Similar al de Home) */}
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

                {/* Navbar (Componente reutilizado) */}
                <Navbar />

                {/* Contenido principal: Grid de 3 columnas (1/3 para la lista, 2/3 para el detalle) */}
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Columna Izquierda: Lista de Ranking */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-300/20">
                        <div className="mb-4 bg-gray-100 p-3 rounded-md border border-gray-300/20 shadow-sm">
                            <h2 className="text-xl font-light text-gray-800 text-center">Ranking</h2>
                        </div>

                        <div className="space-y-3">
                            {topUsersData.map(user => (
                                <UserListItem
                                    key={user.id}
                                    user={user}
                                    isSelected={selectedUser && selectedUser.id === user.id}
                                    onClick={setSelectedUser} // Función para actualizar el estado al hacer clic
                                />
                            ))}
                        </div>
                    </div>

                    {/* Columna Derecha: Detalles del Usuario Seleccionado */}
                    <div className="lg:col-span-2">
                        <UserDetailPanel user={selectedUser} />
                    </div>
                </main>
            </div>
        </Base>
    );
}