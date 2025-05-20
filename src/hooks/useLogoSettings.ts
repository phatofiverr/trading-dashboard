
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LogoSettings {
  primaryText: string;
  primaryColor: string;
  secondaryText: string;
  secondaryColor: string;
}

interface LogoSettingsStore {
  settings: LogoSettings;
  updateSettings: (newSettings: Partial<LogoSettings>) => void;
}

export const useLogoSettings = create<LogoSettingsStore>()(
  persist(
    (set) => ({
      settings: {
        primaryText: 'Cute',
        primaryColor: 'text-pink-400',
        secondaryText: 'Workstation',
        secondaryColor: 'text-white',
      },
      updateSettings: (newSettings) => 
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        })),
    }),
    {
      name: 'logo-settings',
    }
  )
);
