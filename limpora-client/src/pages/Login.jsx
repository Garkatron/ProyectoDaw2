import { Link } from 'react-router-dom';
import logo from '../assets/logo-provisional.png'; 

export function Login({}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Intentando iniciar sesión...");
    };

    return (
        <div>
            <div className="flex items-center justify-center min-h-screen p-4">
                
                <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl shadow-gray-200 border border-gray-300/20 space-y-6">
                    
                    <header className="flex flex-col items-center">
                        <img 
                            src={logo} 
                            alt="Limpora Logo" 
                            className="w-32 h-32 object-contain flex-shrink-0" 
                        />
                        <h1 className="text-2xl font-light text-gray-800">
                            Iniciar Sesión 
                        </h1>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
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

                        <button
                            type="submit"
                            className="w-full p-3 bg-gray-100 text-gray-800 font-medium rounded-lg shadow-sm border border-gray-300/50 transition duration-150 hover:bg-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                        >
                            Acceder
                        </button>
                    </form>

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