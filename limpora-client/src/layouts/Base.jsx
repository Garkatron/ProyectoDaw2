import React from 'react';

// Este componente base solo proporciona el fondo general y la estructura mínima.
const Base = ({ children }) => {
    return (
        // Aplica el fondo gris muy claro a toda la aplicación, siguiendo la regla 1.
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    );
};

export default Base;