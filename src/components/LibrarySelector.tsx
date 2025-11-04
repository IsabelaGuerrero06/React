import React from 'react';
import { useUILibrary } from '../contexts/UILibraryContext';

const LibrarySelector: React.FC = () => {
  const { currentLibrary, setCurrentLibrary } = useUILibrary();

  const libraries = [
    { 
      id: 'tailwind', 
      label: 'Tailwind CSS',
      // AZUL - Estilo moderno, minimalista, redondeado
      // Aseguramos color de texto visible en modo claro/oscuro y estilo destacado similar a Material
      activeClass: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 dark:from-blue-600 dark:via-blue-700 dark:to-blue-800 text-gray-900 dark:text-white shadow-2xl transform scale-110 rounded-xl font-extrabold uppercase tracking-wide',
      inactiveClass: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-xl font-medium'
    },
    { 
      id: 'material', 
      label: 'Material UI',
      // AMARILLO - Estilo elevado, con sombra fuerte, muy redondeado
      activeClass: 'bg-gradient-to-tr from-yellow-400 via-yellow-500 to-amber-500 dark:from-yellow-500 dark:via-yellow-600 dark:to-amber-600 text-gray-900 shadow-2xl transform scale-110 rounded-2xl font-extrabold uppercase tracking-wide',
      inactiveClass: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900 shadow-md hover:shadow-lg rounded-2xl font-semibold uppercase tracking-wide'
    },
    { 
      id: 'bootstrap', 
      label: 'Bootstrap',
      // VERDE - Estilo clásico, con bordes gruesos, menos redondeado
      // Aseguramos color de texto visible en modo claro/oscuro y estilo más destacado al estar activo
      activeClass: 'bg-green-700 dark:bg-green-800 text-gray-900 dark:text-white shadow-lg transform scale-110 rounded-md border-4 border-green-900 dark:border-green-950 font-black uppercase tracking-wide',
      inactiveClass: 'bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900 border-4 border-green-400 dark:border-green-700 rounded-md font-bold uppercase'
    },
  ];

  return (
    <div className="flex gap-4">
      {libraries.map((lib) => (
        <button
          key={lib.id}
          onClick={() => setCurrentLibrary(lib.id as 'tailwind' | 'material' | 'bootstrap')}
          className={`px-6 py-3 transition-all duration-300 ${
            currentLibrary === lib.id
              ? lib.activeClass
              : lib.inactiveClass
          }`}
        >
          {lib.label}
        </button>
      ))}
    </div>
  );
};

export default LibrarySelector;