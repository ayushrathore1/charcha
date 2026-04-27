import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { AvatarRing } from '../ui/AvatarRing';

export const TopBar = ({ title }) => {
  const { user } = useAuthStore();

  return (
    <header className="h-[80px] px-6 flex items-center justify-between sticky top-0 bg-[#0a0a0f]/80 backdrop-blur-md z-30 border-b border-[var(--border)]">
      <h1 className="text-2xl font-syne font-bold text-white tracking-wide">
        {title}
      </h1>
      
      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-white font-syne">{user.name}</p>
            <p className="text-xs text-[#8b8a9e]">Level {user.level || 1}</p>
          </div>
          <AvatarRing src={user.avatarUrl} alt={user.name} size="sm" status="warm" />
        </div>
      )}
    </header>
  );
};
