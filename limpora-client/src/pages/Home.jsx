import React from 'react';
import Base from '../layouts/Base';
import Navbar from '../components/Navbar';
import News from '../components/News';
import logo from '../assets/logo-provisional.png'

// Componente para la sección 'About' (El bloque grande de la derecha)
const AboutSection = () => (
    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300/20 h-full flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 text-xl font-light">Texto</p>
    </div>
);

export function Home({ }) {
    return (
        <div>
            {/* Contenedor principal: Hacemos de este el Flexbox vertical que ocupa toda la altura */}
            <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-2rem)] space-y-8 p-4 sm:p-8">

                {/* Elementos fijos (no crecen): Título y Navbar */}

                <header className="bg-white p-6 rounded-lg shadow-md border border-gray-300/20 flex justify-center flex-shrink-0">
                    {/* Este contenedor Flex es el que alinea el Logo y el Título */}
                    <div className="flex items-center">
                        <img
                            src={logo}
                            alt="provisional"
                            className="w-32 h-32 object-contain flex-shrink-0"
                        />
                        {/* 💡 AVISO IMPORTANTE: El h1 se ha movido DENTRO del div flex */}
                        <h1 className="text-3xl font-light text-gray-800">Limpora</h1>
                    </div>
                </header>
                <Navbar />

                {/* Contenido principal: Este div crecerá para ocupar el espacio restante */}
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
                    {/* NewsPanel */}
                    <div className="lg:col-span-1">
                        <News />
                    </div>

                    {/* AboutSection: 'h-full' funciona ahora porque el padre (main) tiene 'flex-grow' */}
                    <div className="lg:col-span-2 h-full">
                        <AboutSection />
                    </div>
                </main>
            </div>
        </div>
    )
}