import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BellRing, LogOut, Flame } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/people', icon: Users, label: 'Network' },
  { to: '/nudges', icon: BellRing, label: 'Nudges' },
];

const AvatarPill = ({ user }) => {
  if (!user) return null;
  const initials = user.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <div className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'var(--color-raised)', border: '1px solid var(--color-border)' }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
           style={{ background: 'linear-gradient(135deg,#c084fc,#818cf8)', color: '#fff' }}>
        {initials}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)', maxWidth: '120px' }}>{user.name}</p>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Lv {user.level || 1}</p>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden sm:flex flex-col fixed top-0 left-0 h-screen z-40"
             style={{ width: 'clamp(60px, 11vw, 220px)', background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 h-[72px]">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
               style={{ background: 'linear-gradient(135deg,#c084fc22,#818cf811)', border: '1px solid rgba(192,132,252,0.3)' }}>
            <Flame className="w-4 h-4" style={{ color: '#c084fc' }} />
          </div>
          <span className="hidden lg:block font-black text-base uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
            Context
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 px-3 flex-1 pt-2">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:block">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t space-y-3" style={{ borderColor: 'var(--color-border)' }}>
          <AvatarPill user={user} />
          <button
            onClick={() => { logout(); navigate('/auth'); }}
            className="w-full nav-item justify-center lg:justify-start text-sm"
            style={{ color: 'var(--color-ghost)' }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden lg:block">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex"
           style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', backdropFilter: 'blur(12px)' }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex-1 flex flex-col items-center py-3 gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${isActive ? '' : 'opacity-40'}`}
            style={({ isActive }) => ({ fontFamily: 'var(--font-display)', color: isActive ? '#c084fc' : 'var(--color-muted)' })}>
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
};
