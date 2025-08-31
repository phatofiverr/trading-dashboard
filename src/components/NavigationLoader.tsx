import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NavigationLoader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show loading indicator when location changes
    setIsLoading(true);
    
    // Hide loading indicator after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {isLoading && (
        <>
          {/* Main loading bar */}
          <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 1, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-gradient-to-r from-trading-accent1 via-trading-accent1/90 to-trading-accent1 origin-left shadow-lg shadow-trading-accent1/20"
            style={{
              transformOrigin: 'left',
            }}
          />

          {/* Subtle glow effect */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.3 }}
            exit={{ scaleX: 1, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
              delay: 0.1,
            }}
            className="fixed top-0 left-0 right-0 z-[9998] h-1 bg-gradient-to-r from-trading-accent1/20 via-trading-accent1/40 to-trading-accent1/20 blur-sm origin-left"
            style={{
              transformOrigin: 'left',
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default NavigationLoader;
