
import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline'; // Asegúrate de tener instalados los íconos (ej: npm install @heroicons/react)

const navItems = [
  { name: 'Home', href: '#' },
  { name: 'Ganancias', href: '#' },
  { name: 'Reseñas', href: '#' },
  { name: 'Citas', href: '#' },
  { name: 'Top', href: '#' },
  { name: 'Reseñas', href: '#' },
];

const Navbar = () => {
  return (
    <nav className="bg-white p-4 rounded-lg shadow-md border border-gray-300/20 flex justify-between items-center">
      {/* Items de Navegación */}
      <div className="flex space-x-4 md:space-x-8 overflow-x-auto">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="text-gray-700 text-sm md:text-base font-medium p-2 rounded-md transition-colors whitespace-nowrap hover:bg-gray-100/50 hover:text-gray-800"
          >
            {item.name}
          </a>
        ))}
      </div>
      
      {/* Ícono de Perfil */}
      <div className="p-2 rounded-full transition-colors hover:bg-gray-100/50 cursor-pointer flex-shrink-0">
        <UserCircleIcon className="h-8 w-8 text-gray-600" />
      </div>
    </nav>
  );
};

export default Navbar;
