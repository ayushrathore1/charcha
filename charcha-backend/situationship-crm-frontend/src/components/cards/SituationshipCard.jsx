import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Instagram, Twitter, Linkedin, Users, Gamepad2, Sparkles, MessageSquare, ArrowUpRight } from 'lucide-react';

const PLATFORM_ICON = {
  instagram: Instagram, twitter: Twitter, linkedin: Linkedin,
  irl: Users, discord: Gamepad2, other: Sparkles,
};

const WARMTH_STYLE = {
  warm:    { glow: '#ff6b3d', label: 'Warm',    cls: 'badge-warm' },
  cooling: { glow: '#4db8ff', label: 'Cooling', cls: 'badge-cooling' },
  cold:    { glow: '#5899be', label: 'Cold',     cls: 'badge-cold' },
  frozen:  { glow: '#3d3d52', label: 'Frozen',  cls: 'badge-frozen' },
};

const LEFT_BORDER_COLOR = {
  warm: '#ff6b3d', cooling: '#4db8ff', cold: '#1e4d6b', frozen: '#1a1a27',
};

const WarmthBar = ({ score }) => {
  const glow = score >= 80 ? 'warmth-glow-hot' : score >= 60 ? 'warmth-glow-warm' : score >= 30 ? 'warmth-glow-cooling' : score >= 10 ? 'warmth-glow-cold' : 'warmth-glow-frozen';
  return (
    <div className="warmth-bar-track">
      <div className={`warmth-bar-fill ${glow}`} style={{ width: `${score}%` }} />
    </div>
  );
};

export const SituationshipCard = ({ ship, index }) => {
  const Icon = PLATFORM_ICON[ship.person.platform] || Sparkles;
  const style = WARMTH_STYLE[ship.status] || WARMTH_STYLE.frozen;

  return (
    <Link
      to={`/people/${ship._id}`}
      className="glass block group anim-fade-up hover:-translate-y-1 transition-transform duration-200"
      style={{ animationDelay: `${index * 60}ms`, borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: LEFT_BORDER_COLOR[ship.status] || 'transparent' }}
    >
      <div className="p-5">
        {/* Top row */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm relative shrink-0"
                 style={{ background: `${style.glow}22`, border: `1px solid ${style.glow}44`, color: style.glow, fontFamily: 'var(--font-display)' }}>
              {ship.person.name.charAt(0).toUpperCase()}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <Icon className="w-2.5 h-2.5" style={{ color: 'var(--color-muted)' }} />
              </div>
            </div>
            <div>
              <p className="font-black text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>{ship.person.name}</p>
              {ship.person.handle && <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{ship.person.handle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge-status ${style.cls}`}>{style.label}</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
          </div>
        </div>

        {/* Tags */}
        {ship.person.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {ship.person.tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                    style={{ background: 'var(--color-raised)', color: 'var(--color-muted)', fontFamily: 'var(--font-display)', border: '1px solid var(--color-border)' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Warmth bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--color-ghost)', fontFamily: 'var(--font-display)' }}>
            <span className="font-bold uppercase tracking-wider">Warmth</span>
            <span className="font-black">{Math.round(ship.warmthScore)}°</span>
          </div>
          <WarmthBar score={ship.warmthScore} />
        </div>

        {/* Footer */}
        <div className="pt-3 flex justify-between items-center text-xs" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-ghost)' }}>
          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {formatDistanceToNow(new Date(ship.lastInteractionAt), { addSuffix: true })}</span>
          <span>{ship.interactionCount} interactions</span>
        </div>
      </div>
    </Link>
  );
};
