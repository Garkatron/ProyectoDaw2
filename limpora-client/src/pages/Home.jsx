import React from 'react';
import Base from '../layouts/Base';
import Navbar from '../components/Navbar';
import News from '../components/News';

// Componente para la sección 'About' (El bloque grande de la derecha)
const AboutSection = () => (
  <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300/20 h-full flex items-center justify-center min-h-[400px]">
    <p className="text-gray-500 text-xl font-light">Texto</p>
  </div>
);

export function Home({}) {
    return (
        // El contenido de la página Home se envuelve en el layout Base
        <Base>
            {/* Contenedor centrado y con espaciado amplio */}
            <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-0">
                
                {/* Título Central */}
                <header className="bg-white p-6 rounded-lg shadow-md border border-gray-300/20 text-center">
                    <h1 className="text-3xl font-light text-gray-800">Limpora</h1>
                </header>

                {/* 1. Navbar (Componente separado) */}
                <Navbar />

                {/* 2. Contenido principal: Noticias a la izquierda y About a la derecha */}
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna Izquierda: NewsPanel (Componente separado) */}
                    <div className="lg:col-span-1">
                        <News />
                    </div>

                    {/* Columna Derecha: AboutSection */}
                    <div className="lg:col-span-2">
                        <AboutSection />
                    </div>
                </main>
            </div>
        </Base>
    )
}