// src/components/Modal.jsx
import React from "react";

export function Modal({ isOpen, onClose, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white bg-opacity-90 rounded-lg shadow-xl max-w-sm w-full p-6 space-y-4 pointer-events-auto">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <p className="text-gray-600">{message}</p>
        <button
          onClick={onClose}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
