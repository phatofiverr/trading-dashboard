"use client";

import { useEffect, useState } from "react";
import { detectSession } from "./utils/sessionDetector";

interface SessionDisplayProps {
  entryTime?: string;
  entryTimezone?: string;
  session?: string;
  className?: string;
}

// Session images mapping
const sessionImages = {
  'Asia': {
    src: '/asia.jpg',
    alt: 'Asian Trading Session',
    description: 'Tokyo, Hong Kong, Singapore Markets'
  },
  'London': {
    src: '/london.jpg', // You'll need to add this image
    alt: 'London Trading Session',
    description: 'London Stock Exchange, European Markets'
  },
  'NY': {
    src: '/ny.jpg', // You'll need to add this image
    alt: 'New York Trading Session',
    description: 'NYSE, NASDAQ, US Markets'
  },
  'Overlap': {
    src: '/overlap.jpg', // You'll need to add this image
    alt: 'London/NY Overlap Session',
    description: 'High Volume Trading Period'
  },
  'Late NY': {
    src: '/late-ny.jpg', // You'll need to add this image
    alt: 'Late NY Trading Session',
    description: 'After Hours Trading'
  },
  'Unknown': {
    src: '/placeholder.svg',
    alt: 'Unknown Session',
    description: 'Session not detected'
  }
};

export default function SessionDisplay({ 
  entryTime, 
  entryTimezone, 
  session: propSession, 
  className = "" 
}: SessionDisplayProps) {
  const [currentSession, setCurrentSession] = useState<string>('Unknown');

  // Auto-detect session when time or timezone changes
  useEffect(() => {
    if (propSession) {
      setCurrentSession(propSession);
    } else if (entryTime && entryTimezone) {
      const detectedSession = detectSession(entryTime, entryTimezone);
      setCurrentSession(detectedSession);
    } else {
      setCurrentSession('Unknown');
    }
  }, [entryTime, entryTimezone, propSession]);

  const sessionImage = sessionImages[currentSession as keyof typeof sessionImages] || sessionImages['Unknown'];
  const hasImage = ['Asia', 'London', 'NY'].includes(currentSession);
  const showInfoCard = !hasImage || currentSession === 'Overlap' || currentSession === 'Late NY';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Session Info Card - Only show for non-major sessions or specific cases */}
      {showInfoCard && (
        <div className="bg-[#0A0A0A] rounded-lg border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-white/60">Trading Session (Auto-detected)</span>
              <div className="text-lg font-semibold text-white mt-1">
                {currentSession === 'Unknown' ? 'No Major Session' : currentSession}
              </div>
            </div>
            <div className="text-sm text-white/80">
              {currentSession === 'Overlap' ? 'High Liquidity' : 'Normal Liquidity'}
            </div>
          </div>
        </div>
      )}

      {/* Session Image - Only show for major sessions with images */}
      {hasImage && (
        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-[#0A0A0A] border border-white/10">
          <img 
            src={sessionImage.src} 
            alt={sessionImage.alt}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="text-lg font-semibold text-white mb-1">
              {currentSession}
            </div>
            <div className="text-sm text-white/80">
              {sessionImage.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
