import React from 'react';

// Componente para un item de noticia individual
const NewsItem = ({ title }) => (
  <div className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-300/20 transition-colors hover:bg-gray-100 cursor-pointer">
    <p className="text-sm font-medium text-gray-700">{title}</p>
  </div>
);

const NewsPanel = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300/20">
      {/* Título del Panel */}
      <div className="mb-4 bg-gray-100 p-3 rounded-md border border-gray-300/20 shadow-sm">
        <h2 className="text-xl font-light text-gray-800 text-center">Noticias</h2>
      </div>

      {/* Lista de Noticias con espaciado amplio */}
      <div className="space-y-4">
        <NewsItem title="Noticia Principal del Día" />
        <NewsItem title="Actualización Importante del Sistema" />
        <NewsItem title="Análisis de Rendimiento Semanal" />
      </div>
    </div>
  );
};

export default NewsPanel;