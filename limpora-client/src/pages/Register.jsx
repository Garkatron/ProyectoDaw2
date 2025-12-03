import { Link } from 'react-router-dom';
import logo from '../assets/logo-provisional.png';


export function Rergister({ }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Intentando registrar nuevo usuario...");
        // Lógica para registrar al nuevo usuario
    };

    return (
        <div>
            {/* Contenedor principal: Centrado en la pantalla */}
            <div className="flex items-center justify-center min-h-screen p-4">

                {/* Tarjeta de Registro: Estilo minimalista */}
                <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl shadow-gray-200 border border-gray-300/20 space-y-6">

                    {/* Header con Icono y Título */}
                    <header className="flex flex-col items-center">
                        {/* Ícono de Perfil (Simulando el wireframe) */}
                        {/* Logo */}
                        <img
                            src={logo}
                            alt="Limpora Logo"
                            className="w-32 h-32 object-contain flex-shrink-0"
                        />

                        {/* Título de la Acción */}
                        <h1 className="text-2xl font-light text-gray-800">
                            Registro
                        </h1>
                    </header>

                    {/* Formulario de Registro */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Campo 1: Nombre */}
                        <div>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                placeholder="Nombre completo"
                                className="w-full p-4 bg-gray-100/50 border border-gray-300/50 rounded-lg shadow-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400/50 transition duration-150"
                            />
                        </div>

                        {/* Campo 2: Correo Electrónico*/}
                        <div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="Correo Electrónico"
                                className="w-full p-4 bg-gray-100/50 border border-gray-300/50 rounded-lg shadow-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400/50 transition duration-150"
                            />
                        </div>

                        {/* Campo 3: Contraseña */}
                        <div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="Contraseña"
                                className="w-full p-4 bg-gray-100/50 border border-gray-300/50 rounded-lg shadow-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400/50 transition duration-150"
                            />
                        </div>

                        {/* Contenedor de Botones (Confirmar y Cancelar) */}
                        <div className="flex justify-between pt-2 space-x-4">

                            {/* Botón Confirmar (Principal) */}
                            <button
                                type="submit"
                                // Estilo similar al input, pero como botón principal
                                className="w-1/2 p-3 bg-gray-100 text-gray-800 font-medium rounded-lg shadow-sm border border-gray-300/50 transition duration-150 hover:bg-gray-200/70 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                            >
                                Confirmar
                            </button>

                            {/* Botón Cancelar (Secundario) - Usa Link para volver al Login */}
                            <Link
                                to="/login"
                                // Estilo de botón secundario, también neutro
                                className="w-1/2 p-3 text-center bg-gray-50 text-gray-600 font-medium rounded-lg shadow-sm border border-gray-300/50 transition duration-150 hover:bg-gray-100/70 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                            >
                                Cancelar
                            </Link>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}