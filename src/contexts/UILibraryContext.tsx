import { createContext, useContext, useState, useEffect } from 'react';

type UILibrary = 'tailwind' | 'material' | 'bootstrap';

interface UILibraryContextType {
  library: UILibrary;
  setLibrary: (lib: UILibrary) => void;
}

const UILibraryContext = createContext<UILibraryContextType>({
  library: 'tailwind',
  setLibrary: () => {},
});

export const useUILibrary = () => useContext(UILibraryContext);

export const UILibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [library, setLibrary] = useState<UILibrary>(() => {
    const saved = localStorage.getItem('ui-library');
    return (saved as UILibrary) || 'tailwind';
  });

  useEffect(() => {
    localStorage.setItem('ui-library', library);
  }, [library]);

  return (
    <UILibraryContext.Provider value={{ library, setLibrary }}>
      {children}
    </UILibraryContext.Provider>
  );
};