
import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline'; // Asegúrate de tener instalados los íconos (ej: npm install @heroicons/react)
import { Link } from 'react-router-dom';

const navItems = [

  { name: 'Home', to: '/' }, 
  { name: 'Ganancias', to: '/currency' },
  { name: 'Reseñas', to: '/reviews' },
  { name: 'Citas', to: '/citas' },
  { name: 'Top', to: '/top' },
];

const Navbar = () => {
  return (
    <nav className="bg-white p-4 rounded-lg shadow-md border border-gray-300/20 flex justify-between items-center">
      {/* Items de Navegación */}
      <div className="flex space-x-4 md:space-x-8 overflow-x-auto">
        {navItems.map((item) => (
          // 💡 Corrección 2: Usar el componente Link y el atributo 'to'
          <Link
            key={item.name}
            to={item.to} // Usamos 'to' para la ruta interna
            className="text-gray-700 text-sm md:text-base font-medium p-2 rounded-md transition-colors whitespace-nowrap hover:bg-gray-100/50 hover:text-gray-800"
          >
            {item.name}
          </Link>
        ))}
      </div>
      
      {/* Ícono de Perfil (usualmente lleva a la configuración o perfil del usuario) */}
      {/* Lo convertimos en un Link para que sea navegable */}
      <Link 
        to="/me" // Ruta de ejemplo para el perfil
        className="p-2 rounded-full transition-colors hover:bg-gray-100/50 cursor-pointer flex-shrink-0"
      >
        <UserCircleIcon className="h-8 w-8 text-gray-600" />
      </Link>
    </nav>
  );
};

export default Navbar;


