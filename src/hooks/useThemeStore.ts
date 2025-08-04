
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeName = 'fintechAesthetic' | 'turquoiseRed' | 'whiteMinimalist' | 'classicBlue' | 'darkNeon' | 'custom';

interface ThemeColors {
  winColor: string;
  breakEvenColor: string;
  lossColor: string;
  positiveColor: string;
  negativeColor: string;
  neutralColor: string;
}

interface CustomTheme extends ThemeColors {
  name: string;
}

interface StrategyThemes {
  [strategyId: string]: {
    themeName: ThemeName;
    customColors?: ThemeColors;
  };
}

interface ThemeState {
  currentTheme: ThemeName;
  customThemes: CustomTheme[];
  strategyThemes: StrategyThemes;
  setTheme: (theme: ThemeName) => void;
  setStrategyTheme: (strategyId: string, themeName: ThemeName, customColors?: ThemeColors) => void;
  getThemeColorsForStrategy: (strategyId?: string) => ThemeColors;
  getThemeColors: () => ThemeColors;
  addCustomTheme: (name: string, colors: ThemeColors) => void;
  updateCustomTheme: (name: string, colors: ThemeColors) => void;
  deleteCustomTheme: (name: string) => void;
}

const defaultThemeColors: Record<ThemeName, ThemeColors> = {
  fintechAesthetic: {
    winColor: '#15b9a6',
    breakEvenColor: '#8E9196',
    lossColor: '#D12B35',
    positiveColor: '#15b9a6',
    negativeColor: '#D12B35',
    neutralColor: '#64748B',
  },
  turquoiseRed: {
    winColor: '#15b9a6',
    breakEvenColor: '#94A3B8',
    lossColor: '#D12B35',
    positiveColor: '#15b9a6',
    negativeColor: '#D12B35',
    neutralColor: '#CBD5E1',
  },
  whiteMinimalist: {
    winColor: '#15b9a6',
    breakEvenColor: '#CBD5E1',
    lossColor: '#D12B35',
    positiveColor: '#15b9a6',
    negativeColor: '#D12B35',
    neutralColor: '#E2E8F0',
  },
  classicBlue: {
    winColor: '#15b9a6',
    breakEvenColor: '#8A898C',
    lossColor: '#D12B35',
    positiveColor: '#15b9a6',
    negativeColor: '#D12B35',
    neutralColor: '#94A3B8',
  },
  darkNeon: {
    winColor: '#15b9a6',
    breakEvenColor: '#D946EF',
    lossColor: '#D12B35',
    positiveColor: '#15b9a6',
    negativeColor: '#D12B35',
    neutralColor: '#A78BFA',
  },
  custom: {
    winColor: '#15b9a6',
    breakEvenColor: '#8E9196',
    lossColor: '#D12B35',
    positiveColor: '#15b9a6',
    negativeColor: '#D12B35',
    neutralColor: '#64748B',
  },
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: 'fintechAesthetic',
      customThemes: [],
      strategyThemes: {},
      
      setTheme: (theme) => set({ currentTheme: theme }),
      
      setStrategyTheme: (strategyId, themeName, customColors) => {
        set((state) => {
          const newStrategyThemes = {
            ...state.strategyThemes,
            [strategyId]: { 
              themeName,
              customColors: customColors || undefined
            }
          };
          return {
            strategyThemes: newStrategyThemes
          };
        });
      },
      
      getThemeColorsForStrategy: (strategyId) => {
        if (!strategyId) return get().getThemeColors();
        
        const strategyTheme = get().strategyThemes[strategyId];
        if (!strategyTheme) return get().getThemeColors();
        
        if (strategyTheme.themeName === 'custom' && strategyTheme.customColors) {
          return strategyTheme.customColors;
        }
        
        return defaultThemeColors[strategyTheme.themeName];
      },
      
      getThemeColors: () => {
        const { currentTheme } = get();
        return defaultThemeColors[currentTheme];
      },
      
      addCustomTheme: (name, colors) => {
        set((state) => ({
          customThemes: [...state.customThemes, { name, ...colors }]
        }));
      },
      
      updateCustomTheme: (name, colors) => {
        set((state) => ({
          customThemes: state.customThemes.map(theme => 
            theme.name === name ? { name, ...colors } : theme
          )
        }));
      },
      
      deleteCustomTheme: (name) => {
        set((state) => ({
          customThemes: state.customThemes.filter(theme => theme.name !== name)
        }));
      }
    }),
    { name: 'theme-storage' }
  )
);
