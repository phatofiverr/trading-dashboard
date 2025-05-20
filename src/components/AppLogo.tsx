
import React from 'react';
import { Link } from 'react-router-dom';
import { useLogoSettings } from '@/hooks/useLogoSettings';

interface AppLogoProps {
  className?: string;
  hideText?: boolean;
}

const AppLogo: React.FC<AppLogoProps> = ({ className = "", hideText = false }) => {
  const { settings } = useLogoSettings();
  
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      {!hideText && (
        <span className="font-semibold text-lg">
          <span className={settings.primaryColor}>{settings.primaryText}</span>
          <span className={settings.secondaryColor}>{settings.secondaryText}</span>
        </span>
      )}
    </Link>
  );
};

export default AppLogo;
