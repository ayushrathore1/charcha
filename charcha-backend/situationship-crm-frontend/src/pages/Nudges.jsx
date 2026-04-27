import React, { useEffect, useState } from 'react';
import { nudgeApi } from '../api/situationships';
import { NudgeCard } from '../components/cards/NudgeCard';
import { Bell } from 'lucide-react';

export const Nudges = () => {
  const [nudges, setNudges] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await nudgeApi.getPending();
      if (res.success) setNudges(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    setNudges(prev => prev.filter(n => n._id !== id));
    try { await nudgeApi.updateStatus(id, status); } catch { load(); }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ color: 'var(--color-text)' }}>
      <header className="sticky top-0 z-30 px-6 flex items-center h-[72px]"
              style={{ background: 'rgba(9,9,14,0.8)', borderBottom: '1px solid var(--color-border)', backdropFilter: 'blur(12px)' }}>
        <div>
          <h1 className="text-xl font-black uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
            Nudge Inbox
            {nudges.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-black" style={{ background: '#c084fc22', color: '#c084fc', border: '1px solid #c084fc44' }}>{nudges.length}</span>
            )}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>AI-suggested re-engagement messages</p>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-2xl mx-auto w-full pb-24 sm:pb-6">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 rounded-full border-4 anim-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: '#c084fc' }} />
          </div>
        ) : nudges.length > 0 ? (
          <div className="space-y-4">
            {nudges.map(n => <NudgeCard key={n._id} nudge={n} onStatusUpdate={handleStatus} />)}
          </div>
        ) : (
          <div className="glass flex flex-col items-center justify-center py-24 text-center anim-fade-up">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--color-raised)' }}>
              <Bell className="w-7 h-7 opacity-25" />
            </div>
            <p className="font-black text-lg mb-1" style={{ fontFamily: 'var(--font-display)' }}>Inbox Zero</p>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No pending nudges. Generate one from a connection's profile.</p>
          </div>
        )}
      </main>
    </div>
  );
};
