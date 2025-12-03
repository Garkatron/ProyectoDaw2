import React, { useState } from 'react';

export default function Carrousel({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = images.length;

  const prev = () => setActiveIndex(activeIndex === 0 ? total - 1 : activeIndex - 1);
  const next = () => setActiveIndex(activeIndex === total - 1 ? 0 : activeIndex + 1);

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 select-none">
      <div className="relative w-full aspect-video overflow-hidden bg-gray-100 rounded-lg border border-gray-300/20 shadow-sm">
        {images.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-500 ${i === activeIndex ? 'opacity-100' : 'opacity-0'} `}
          >
            <img
              src={src}
              alt={`Slide ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Left button */}
        <button
          onClick={prev}
          className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/70 hover:bg-white shadow-sm border border-gray-300/20 w-10 h-10 rounded-full flex items-center justify-center text-gray-700 transition"
        >
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right button */}
        <button
          onClick={next}
          className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/70 hover:bg-white shadow-sm border border-gray-300/20 w-10 h-10 rounded-full flex items-center justify-center text-gray-700 transition"
        >
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}