import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline'; // Asegúrate de tener instalados los íconos (ej: npm install @heroicons/react)
import { Link } from 'react-router-dom';
import lang from '../utils/LangManager';

const navItems = [

  { name: "nav.items.path.root", to: "/" }, 
  { name: "nav.items.path.currency", to: "/currency" },
  { name: "nav.items.path.appointments", to: "/appointments" },
  { name: "nav.items.path.userfinder", to: "/userfinder" },
  { name: "nav.items.path.topusers", to: "/top" },
];

const Navbar = () => {
  return (
    <nav className="bg-white p-4 rounded-lg shadow-md border border-gray-300/20 flex justify-between items-center">
      <div className="flex space-x-4 md:space-x-8 overflow-x-auto">
        {navItems.map((item) => (
          <Link
            key={lang(item.name)}
            to={item.to} 
            className="text-gray-700 text-sm md:text-base font-medium p-2 rounded-md transition-colors whitespace-nowrap hover:bg-gray-100/50 hover:text-gray-800"
          >
            {lang(item.name)}
          </Link>
        ))}
      </div>
      
      <Link 
        to="/me"
        className="p-2 rounded-full transition-colors hover:bg-gray-100/50 cursor-pointer flex-shrink-0"
      >
        <UserCircleIcon className="h-8 w-8 text-gray-600" />
      </Link>
    </nav>
  );
};

export default Navbar;


