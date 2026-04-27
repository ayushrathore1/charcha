import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const StatusBadge = ({ status, className }) => {
  const getStatusStyles = () => {
    switch(status) {
      case 'warm': return 'bg-[#ff4d1a]/20 text-[#ff4d1a] border-[#ff4d1a]/30';
      case 'cooling': return 'bg-[#4db8ff]/20 text-[#4db8ff] border-[#4db8ff]/30';
      case 'cold': return 'bg-[#1e4d6b]/40 text-[#1e4d6b] border-[#1e4d6b]/30';
      case 'frozen': return 'bg-[#0d1f2d] text-[#8b8a9e] border-[#3d3d52] animate-pulse-slow';
      default: return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider', getStatusStyles(), className)}>
      {status}
    </span>
  );
};
