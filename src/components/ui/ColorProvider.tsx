/**
 * Color Provider Component
 * 
 * Provides centralized color system through React Context
 * for components that can't use hooks directly.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { colorPalette, colorUtils } from '@/lib/colorPalette';

interface ColorContextType {
  palette: typeof colorPalette;
  utils: typeof colorUtils;
}

const ColorContext = createContext<ColorContextType | null>(null);

interface ColorProviderProps {
  children: ReactNode;
}

export const ColorProvider: React.FC<ColorProviderProps> = ({ children }) => {
  const value = {
    palette: colorPalette,
    utils: colorUtils,
  };

  return (
    <ColorContext.Provider value={value}>
      {children}
    </ColorContext.Provider>
  );
};

/**
 * Hook to access color context
 */
export const useColorContext = () => {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error('useColorContext must be used within a ColorProvider');
  }
  return context;
};

export default ColorProvider;