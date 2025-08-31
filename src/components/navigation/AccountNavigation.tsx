import React, { memo, useRef, useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface NavigationItem {
  id: string;
  label: string;
  description?: string;
}

interface AccountNavigationProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  className?: string;
}

// Memoize navigation items to prevent re-renders
const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Equity curves and risk metrics'
  },
  {
    id: 'analysis',
    label: 'Analysis',
    description: 'Statistics and trading calendar'
  },
  {
    id: 'models',
    label: 'Models',
    description: 'Volatility and advanced models'
  },
  {
    id: 'performance',
    label: 'Performance',
    description: 'KPIs and heatmaps'
  },
  {
    id: 'trades',
    label: 'Trades',
    description: 'Trade history and details'
  }
];

const AccountNavigation: React.FC<AccountNavigationProps> = memo(({
  activeSection,
  onSectionChange,
  className
}) => {
  const navRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>(new Array(NAVIGATION_ITEMS.length).fill(null));
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Spring animation values with easing curve - optimized for smooth transitions
  const underlineX = useSpring(0, {
    stiffness: 500,
    damping: 35,
    mass: 0.8,
    velocity: 0,
    restDelta: 0.01
  });

  const underlineWidth = useSpring(0, {
    stiffness: 500,
    damping: 35,
    mass: 0.8,
    velocity: 0,
    restDelta: 0.01
  });

  // Background animation values - smoother transitions
  const backgroundX = useSpring(0, {
    stiffness: 400,
    damping: 30,
    mass: 0.4,
    velocity: 0,
    restDelta: 0.001
  });

  const backgroundWidth = useSpring(0, {
    stiffness: 400,
    damping: 30,
    mass: 0.4,
    velocity: 0,
    restDelta: 0.001
  });

  // Update positions when active section or hover changes
  useEffect(() => {
    const updatePositions = () => {
      if (!navRef.current) return;

      const navRect = navRef.current.getBoundingClientRect();

      // Update underline position (follows active tab)
      const activeIndex = NAVIGATION_ITEMS.findIndex(item => item.id === activeSection);
      const activeTab = tabRefs.current[activeIndex];

      if (activeTab) {
        const tabRect = activeTab.getBoundingClientRect();
        const left = tabRect.left - navRect.left;
        const width = tabRect.width;

        underlineX.set(left);
        underlineWidth.set(width);
        setUnderlineStyle({ left, width });
      }

      // Update background position (only when hovering)
      if (hoveredIndex !== null) {
        const targetTab = tabRefs.current[hoveredIndex];

        if (targetTab) {
          const tabRect = targetTab.getBoundingClientRect();
          const left = tabRect.left - navRect.left;
          const width = tabRect.width;

          // Only update if we have valid dimensions
          if (width > 0 && left >= 0) {
            backgroundX.set(left);
            backgroundWidth.set(width);
          }
        }
      }
    };

    // Immediate update for all changes to ensure smooth transitions
    updatePositions();
  }, [activeSection, hoveredIndex, underlineX, underlineWidth, backgroundX, backgroundWidth]);

  // Ensure background is visible on initial mount
  useEffect(() => {
    const initializeBackground = () => {
      if (!navRef.current) return;

      const activeIndex = NAVIGATION_ITEMS.findIndex(item => item.id === activeSection);
      const activeTab = tabRefs.current[activeIndex];

      if (activeTab) {
        const navRect = navRef.current.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        const left = tabRect.left - navRect.left;
        const width = tabRect.width;

        // Set initial values without animation
        backgroundX.set(left);
        backgroundWidth.set(width);
      }
    };

    // Small delay to ensure DOM is fully ready
    const timeoutId = setTimeout(initializeBackground, 100);
    return () => clearTimeout(timeoutId);
  }, []); // Only run on mount

  return (
    <NavigationMenu className={cn(
      "relative flex items-center justify-center w-full bg-black border-b border-white/10 max-w-none",
      className
    )}>
      <div
        ref={navRef}
        className="flex items-center space-x-0 w-full max-w-4xl relative"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <NavigationMenuList className="flex items-center space-x-0 w-full">
          {NAVIGATION_ITEMS.map((item, index) => {
            const isActive = activeSection === item.id;
            const isHovered = hoveredIndex === index;

            return (
              <NavigationMenuItem key={item.id} className="flex-1 h-full">
                <button
                  ref={(el) => (tabRefs.current[index] = el)}
                                onClick={() => {
                // Navigate immediately without clearing hover state
                onSectionChange(item.id);
              }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className={cn(
                    "relative w-full h-full flex-1 flex items-center justify-center py-4 px-6 cursor-pointer",
                    "focus:outline-none focus:ring-0",
                    // Text color changes based on active and hover states
                    isActive
                      ? "text-white"
                      : isHovered
                      ? "text-white"
                      : "text-gray-400"
                  )}
                >
                  <span className="text-sm font-medium text-center relative z-10 pointer-events-none font-inter">
                    {item.label}
                  </span>
                </button>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>

        {/* Animated background rectangle - smoothly transitions between positions */}
        <motion.div
          className="absolute top-2 bottom-2 bg-white/10 rounded-lg pointer-events-none"
          style={{
            x: backgroundX,
            width: backgroundWidth,
            opacity: hoveredIndex !== null ? 1 : 0,
          }}
          transition={{
            x: {
              type: "spring",
              stiffness: 400,
              damping: 30,
              mass: 0.4,
              velocity: 0,
              restDelta: 0.001
            },
            width: {
              type: "spring",
              stiffness: 400,
              damping: 30,
              mass: 0.4,
              velocity: 0,
              restDelta: 0.001
            },
            opacity: { duration: 0.2, ease: "easeInOut" }
          }}
        />

        {/* Animated underline indicator */}
        <motion.div
          key={`underline-${activeSection}`}
          className="absolute bottom-0 h-0.5 bg-white rounded-full"
          style={{
            x: underlineX,
            width: underlineWidth,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
            mass: 0.8,
            velocity: 0,
            restDelta: 0.01,
            delay: 0.02 // Minimal delay for visual hierarchy
          }}
        />
      </div>
    </NavigationMenu>
  );
});

AccountNavigation.displayName = 'AccountNavigation';

export default AccountNavigation;
