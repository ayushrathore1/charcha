import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, BellOff, Send, Clock3 } from 'lucide-react';

export const NudgeCard = ({ nudge, onStatusUpdate }) => {
  const [typed, setTyped] = useState(false);
  useEffect(() => { const t = setTimeout(() => setTyped(true), 600 + Math.random() * 800); return () => clearTimeout(t); }, []);

  const name = nudge.situationship?.person?.name || 'Someone';
  const status = nudge.situationship?.status || 'cooling';
  const warmth = nudge.situationship?.warmthScore || 0;
  const borderColor = status === 'warm' ? '#ff6b3d' : status === 'cooling' ? '#4db8ff' : '#3d3d52';

  return (
    <div className="glass anim-fade-up" style={{ borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: borderColor }}>
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-black text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
              Reconnect with <span style={{ color: '#c084fc' }}>{name}</span>
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{nudge.context}</p>
          </div>
          <div className="text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ml-4"
               style={{ background: `${warmth > 50 ? '#ff6b3d' : '#4db8ff'}15`, color: warmth > 50 ? '#ff6b3d' : '#4db8ff', border: `1px solid ${warmth > 50 ? '#ff6b3d' : '#4db8ff'}30`, fontFamily: 'var(--font-display)' }}>
            {Math.round(warmth)}°
          </div>
        </div>

        {/* Chat bubble */}
        <div className="rounded-tr-2xl rounded-b-2xl rounded-tl-sm p-4 mb-4 text-sm relative"
             style={{ background: 'var(--color-raised)', border: '1px solid rgba(192,132,252,0.2)', boxShadow: '0 4px 20px rgba(192,132,252,0.08)' }}>
          <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center"
               style={{ background: '#c084fc', boxShadow: '0 0 10px rgba(192,132,252,0.5)' }}>
            <MessageSquare className="w-2.5 h-2.5 text-black" />
          </div>
          {!typed ? (
            <div className="flex gap-1.5 items-center h-5">
              <span className="w-1.5 h-1.5 rounded-full anim-bounce-1" style={{ background: 'var(--color-muted)' }} />
              <span className="w-1.5 h-1.5 rounded-full anim-bounce-2" style={{ background: 'var(--color-muted)' }} />
              <span className="w-1.5 h-1.5 rounded-full anim-bounce-3" style={{ background: 'var(--color-muted)' }} />
            </div>
          ) : (
            <p className="anim-fade-up" style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>"{nudge.message}"</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={() => onStatusUpdate(nudge._id, 'sent')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            style={{ background: 'linear-gradient(135deg,#c084fc,#818cf8)', color: '#fff', fontFamily: 'var(--font-display)', boxShadow: '0 0 16px rgba(192,132,252,0.3)' }}>
            <Send className="w-3.5 h-3.5" /> Send it
          </button>
          <button onClick={() => onStatusUpdate(nudge._id, 'snoozed')} title="Snooze"
            className="px-3 py-2.5 rounded-xl transition-all btn-ghost">
            <Clock3 className="w-4 h-4" />
          </button>
          <button onClick={() => onStatusUpdate(nudge._id, 'dismissed')} title="Dismiss"
            className="px-3 py-2.5 rounded-xl transition-all"
            style={{ background: 'var(--color-raised)', color: 'var(--color-ghost)', border: '1px solid var(--color-border)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-ghost)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}>
            <BellOff className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
