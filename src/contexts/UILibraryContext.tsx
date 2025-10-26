import React, { createContext, useContext, useState, ReactNode } from 'react';

type UILibrary = 'tailwind' | 'material' | 'bootstrap';

interface UILibraryContextType {
  currentLibrary: UILibrary;
  setCurrentLibrary: (library: UILibrary) => void;
}

const UILibraryContext = createContext<UILibraryContextType | undefined>(undefined);

export const UILibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLibrary, setCurrentLibrary] = useState<UILibrary>('tailwind');

  return (
    <UILibraryContext.Provider value={{ currentLibrary, setCurrentLibrary }}>
      {children}
    </UILibraryContext.Provider>
  );
};

export const useUILibrary = () => {
  const context = useContext(UILibraryContext);
  if (context === undefined) {
    throw new Error('useUILibrary must be used within a UILibraryProvider');
  }
  return context;
};