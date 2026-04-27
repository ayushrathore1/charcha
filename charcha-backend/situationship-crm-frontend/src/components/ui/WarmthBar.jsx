import React, { useEffect, useState } from 'react';
import { cn } from './StatusBadge';

export const WarmthBar = ({ score, className }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // trigger animation
    const raf = requestAnimationFrame(() => setWidth(score));
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const getGradient = () => {
    if (score >= 80) return 'from-[#ff4d1a] to-[#ff8c42] shadow-[0_0_15px_rgba(255,77,26,0.6)]';
    if (score >= 60) return 'from-[#ff8c42] to-[#ffb347] shadow-[0_0_10px_rgba(255,140,66,0.5)]';
    if (score >= 30) return 'from-[#4db8ff] to-[#80cfff] shadow-[0_0_8px_rgba(77,184,255,0.4)]';
    if (score >= 10) return 'from-[#1e4d6b] to-[#2b6a93]';
    return 'from-[#0d1f2d] to-[#1a3854] opacity-50'; // frozen
  };

  return (
    <div className={cn("w-full h-1.5 bg-[#1c1c28] rounded-full overflow-hidden", className)}>
      <div 
        className={cn("h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r", getGradient())}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};
