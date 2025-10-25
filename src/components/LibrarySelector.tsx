import { useUILibrary } from '../contexts/UILibraryContext';

const LibrarySelector = () => {
  const { library, setLibrary } = useUILibrary();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLibrary('tailwind')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
          library === 'tailwind'
            ? 'bg-primary text-white shadow-md scale-105'
            : 'bg-stroke text-body hover:bg-gray-3 dark:bg-strokedark dark:text-bodydark dark:hover:bg-meta-4'
        }`}
      >
        Tailwind CSS
      </button>
      
      <button
        onClick={() => setLibrary('material')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
          library === 'material'
            ? 'bg-primary text-white shadow-md scale-105'
            : 'bg-stroke text-body hover:bg-gray-3 dark:bg-strokedark dark:text-bodydark dark:hover:bg-meta-4'
        }`}
      >
        Material UI
      </button>
      
      <button
        onClick={() => setLibrary('bootstrap')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
          library === 'bootstrap'
            ? 'bg-primary text-white shadow-md scale-105'
            : 'bg-stroke text-body hover:bg-gray-3 dark:bg-strokedark dark:text-bodydark dark:hover:bg-meta-4'
        }`}
      >
        Bootstrap
      </button>
    </div>
  );
};

export default LibrarySelector;