import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { situationshipApi } from '../api/situationships';
import { Users, Flame, AlertCircle, Plus, TrendingUp } from 'lucide-react';
import { SituationshipCard } from '../components/cards/SituationshipCard';
import { AddSituationship } from '../components/modals/AddSituationship';

const StatCard = ({ icon: Icon, color, label, value, delay }) => (
  <div className="glass p-6 relative overflow-hidden anim-fade-up" style={{ animationDelay: delay }}>
    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 -mr-8 -mt-8 pointer-events-none" style={{ background: color }} />
    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: color + '20', border: `1px solid ${color}33` }}>
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <p className="text-4xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>{value}</p>
    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-display)' }}>{label}</p>
  </div>
);

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const load = async () => {
    try {
      const res = await situationshipApi.getDashboard();
      if (res.success) setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (payload) => {
    await situationshipApi.create(payload);
    setIsAddOpen(false);
    load();
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ color: 'var(--color-text)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 px-6 flex items-center justify-between h-[72px]"
              style={{ background: 'rgba(9,9,14,0.8)', borderBottom: '1px solid var(--color-border)', backdropFilter: 'blur(12px)' }}>
        <div>
          <h1 className="text-xl font-black uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>Overview</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Your relationship heat map</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="btn-ghost flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Person
        </button>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full pb-24 sm:pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 rounded-full border-4 border-t-violet-400 anim-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: '#c084fc' }} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard icon={Users} color="#c084fc" label="Total Network" value={data?.totalPeople || 0} delay="0ms" />
              <StatCard icon={Flame} color="#ff6b3d" label="Hot Connections" value={data?.hotConnections || 0} delay="80ms" />
              <StatCard icon={AlertCircle} color="#4db8ff" label="Due for Nudge" value={data?.dueForNudge || 0} delay="160ms" />
            </div>

            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-lg uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
                Recent Connections
              </h2>
              {data?.recentShips?.length > 0 && (
                <Link to="/people" className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition-colors"
                      style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-display)' }}>
                  <TrendingUp className="w-3.5 h-3.5" /> View All
                </Link>
              )}
            </div>

            {data?.recentShips?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {data.recentShips.map((ship, i) => <SituationshipCard key={ship._id} ship={ship} index={i} />)}
              </div>
            ) : (
              <div className="glass flex flex-col items-center justify-center py-20 anim-fade-up">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--color-raised)' }}>
                  <Users className="w-7 h-7 opacity-30" />
                </div>
                <p className="font-black text-lg mb-1" style={{ fontFamily: 'var(--font-display)' }}>Your network is a ghost town.</p>
                <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>Add your first situationship to start tracking heat.</p>
                <button onClick={() => setIsAddOpen(true)} className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>
                  <span className="flex items-center gap-2"><Plus className="w-4 h-4" />Add First Connection</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <AddSituationship isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSubmit={handleAdd} />
    </div>
  );
};
