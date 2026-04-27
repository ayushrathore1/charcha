import React from 'react';
import { cn } from './StatusBadge';

export const AvatarRing = ({ src, alt, status, size = "md", className }) => {
  const getRingColor = () => {
    switch(status) {
      case 'warm': return 'ring-[#ff8c42] ring-offset-[#0a0a0f] ring-offset-2';
      case 'cooling': return 'ring-[#4db8ff] ring-offset-[#0a0a0f] ring-offset-2';
      case 'cold': return 'ring-[#1e4d6b] ring-offset-[#0a0a0f] ring-offset-1';
      case 'frozen': return 'ring-[#3d3d52] ring-offset-[#0a0a0f] ring-offset-0 opacity-60';
      default: return 'ring-transparent';
    }
  };

  const getSizes = () => {
    switch(size) {
      case 'sm': return 'w-8 h-8';
      case 'md': return 'w-12 h-12';
      case 'lg': return 'w-16 h-16';
      case 'xl': return 'w-24 h-24';
      default: return 'w-12 h-12';
    }
  };

  return (
    <div className={cn("relative rounded-full ring-2", getRingColor(), getSizes(), className)}>
      {src ? (
        <img src={src} alt={alt} className="rounded-full w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full rounded-full bg-[#1c1c28] flex items-center justify-center text-[#8b8a9e] font-syne font-bold uppercase overflow-hidden">
          {alt?.charAt(0) || '?'}
        </div>
      )}
    </div>
  );
};
