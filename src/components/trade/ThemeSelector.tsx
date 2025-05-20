
import React from 'react';
import { Palette } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/hooks/useThemeStore';

type ThemeName = 'fintechAesthetic' | 'turquoiseRed' | 'whiteMinimalist' | 'classicBlue' | 'darkNeon';

interface ThemeOption {
  name: string;
  value: ThemeName;
  description: string;
}

const ThemeSelector = () => {
  const { setTheme, currentTheme, getThemeColors } = useThemeStore();
  const colors = getThemeColors();
  
  const themeOptions: ThemeOption[] = [
    {
      name: 'Fintech Aesthetic',
      value: 'fintechAesthetic',
      description: 'Deep navy, neon green, refined red'
    },
    {
      name: 'Turquoise + Red',
      value: 'turquoiseRed',
      description: 'Bright turquoise and red accents'
    },
    {
      name: 'White Minimalist',
      value: 'whiteMinimalist',
      description: 'Clean white with subtle accents'
    },
    {
      name: 'Classic Blue',
      value: 'classicBlue',
      description: 'Professional blue tones'
    },
    {
      name: 'Dark Neon',
      value: 'darkNeon',
      description: 'Vibrant neon colors on dark'
    }
  ];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Theme
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
        {themeOptions.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => setTheme(theme.value)}
            className="flex justify-between items-center cursor-pointer"
          >
            <div className="flex flex-col">
              <span>{theme.name}</span>
              <span className="text-xs text-muted-foreground">{theme.description}</span>
            </div>
            {currentTheme === theme.value && (
              <div className="h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
