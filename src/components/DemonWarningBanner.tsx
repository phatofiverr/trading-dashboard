import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { useDemonWarning } from '@/hooks/useDemonWarning';
import { useNavigate } from 'react-router-dom';

interface DemonWarningBannerProps {
  onDismiss?: () => void;
  showViewStats?: boolean;
  className?: string;
}

const DemonWarningBanner: React.FC<DemonWarningBannerProps> = ({ 
  onDismiss, 
  showViewStats = true, 
  className = "" 
}) => {
  const navigate = useNavigate();
  const { currentMonthCount, isWarningLevel, isCriticalLevel, warningMessage, remainingAllowed } = useDemonWarning();
  
  // Don't show banner if no demons detected
  if (currentMonthCount === 0) {
    return null;
  }
  
  const getBannerStyle = () => {
    if (isCriticalLevel) {
      return "border-red-500/70 bg-red-500/15 shadow-red-500/20";
    } else if (isWarningLevel) {
      return "border-orange-500/70 bg-orange-500/15 shadow-orange-500/20";
    } else {
      return "border-yellow-500/70 bg-yellow-500/15 shadow-yellow-500/20";
    }
  };
  
  const getTextColor = () => {
    if (isCriticalLevel) {
      return "text-red-300";
    } else if (isWarningLevel) {
      return "text-orange-300";
    } else {
      return "text-yellow-300";
    }
  };
  
  const getIconColor = () => {
    if (isCriticalLevel) {
      return "text-red-400";
    } else if (isWarningLevel) {
      return "text-orange-400";
    } else {
      return "text-yellow-400";
    }
  };
  
  const handleViewStats = () => {
    navigate('/demon-finder');
  };
  
  return (
    <Card className={`${getBannerStyle()} shadow-lg ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getIconColor()}`} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">🔥</span>
                <h4 className={`font-semibold ${getTextColor()}`}>
                  {isCriticalLevel ? 'Trading Demons Alert' : isWarningLevel ? 'Demon Warning' : 'Demon Tracker'}
                </h4>
              </div>
              
              <p className={`text-sm ${getTextColor()} mb-2`}>
                {warningMessage}
              </p>
              
              {isCriticalLevel && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-3">
                  <p className="text-red-200 text-sm font-medium mb-1">
                    🛑 Recommended Actions:
                  </p>
                  <ul className="text-red-300 text-xs space-y-1">
                    <li>• Stop trading immediately</li>
                    <li>• Review your trading plan</li>
                    <li>• Work on emotional discipline</li>
                    <li>• Consider taking a break for a few days</li>
                  </ul>
                </div>
              )}
              
              {showViewStats && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleViewStats}
                    className={`
                      border-current text-current hover:bg-current/10
                      ${isCriticalLevel ? 'border-red-400 text-red-400' : 
                        isWarningLevel ? 'border-orange-400 text-orange-400' : 
                        'border-yellow-400 text-yellow-400'}
                    `}
                  >
                    <span className="text-sm mr-1">🔥</span>
                    View Demon Stats
                  </Button>
                  
                  {isCriticalLevel && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        // Could implement a "I understand" acknowledgment
                        onDismiss?.();
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      I Understand
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {onDismiss && !isCriticalLevel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className={`ml-2 p-1 h-auto ${getTextColor()} hover:bg-current/10`}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DemonWarningBanner;