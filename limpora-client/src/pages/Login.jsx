import { Link } from 'react-router-dom';
import logo from '../assets/logo-provisional.png'; 

export function Login({}) {
    // Manejador de formulario simple
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Intentando iniciar sesión...");
        // La lógica de autenticación 
    };

    return (
        <div>
            {/* Contenedor principal: Centrado horizontal y verticalmente en la pantalla */}
            <div className="flex items-center justify-center min-h-screen p-4">
                
                {/* Tarjeta de Login: Fondo blanco, bordes redondeados y sombra suave */}
                <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl shadow-gray-200 border border-gray-300/20 space-y-6">
                    
                    {/* Header con Logo y Título */}
                    <header className="flex flex-col items-center">
                        {/* Logo */}
                        <img 
                            src={logo} 
                            alt="Limpora Logo" 
                            className="w-32 h-32 object-contain flex-shrink-0" 
                        />
                        {/* Título de la Acción */}
                        <h1 className="text-2xl font-light text-gray-800">
                            Iniciar Sesión 
                        </h1>
                    </header>

                    {/* Formulario de Login */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Campo Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required

                                className="w-full p-3 border border-gray-300/50 rounded-md shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400/50 transition duration-150"
                                placeholder="tu.correo@ejemplo.com"
                            />
                        </div>

                        {/* Campo Contraseña */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required

                                className="w-full p-3 border border-gray-300/50 rounded-md shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400/50 transition duration-150"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Botón de Submit */}
                        <button
                            type="submit"
                            // Botón neutro: Gris suave, sombra ligera y hover sutil
                            className="w-full p-3 bg-gray-100 text-gray-800 font-medium rounded-lg shadow-sm border border-gray-300/50 transition duration-150 hover:bg-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                        >
                            Acceder
                        </button>
                    </form>

                    {/* Enlace de Recuperación (Opcional) */}
                    <div className="text-center">
                        <Link to = "/register" className="text-sm text-gray-600 hover:text-blue-800 transition duration-150">
                            Registrarse
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}