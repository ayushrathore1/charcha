import React, { useEffect, useState } from 'react';
import { situationshipApi } from '../api/situationships';
import { SituationshipCard } from '../components/cards/SituationshipCard';
import { AddSituationship } from '../components/modals/AddSituationship';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';

const STATUSES = ['', 'warm', 'cooling', 'cold', 'frozen'];
const STATUS_LABELS = { '': 'All', warm: '🔥 Warm', cooling: '🧊 Cooling', cold: '❄️ Cold', frozen: '💀 Frozen' };

export const People = () => {
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await situationshipApi.getAll(filter, 'warmth');
      if (res.success) setShips(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleAdd = async (payload) => {
    await situationshipApi.create(payload);
    setIsAddOpen(false);
    load();
  };

  const filtered = ships.filter(s =>
    s.person.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.person.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col min-h-screen" style={{ color: 'var(--color-text)' }}>
      <header className="sticky top-0 z-30 px-6 flex items-center justify-between h-[72px]"
              style={{ background: 'rgba(9,9,14,0.8)', borderBottom: '1px solid var(--color-border)', backdropFilter: 'blur(12px)' }}>
        <h1 className="text-xl font-black uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>Network</h1>
        <button onClick={() => setIsAddOpen(true)} className="btn-primary flex items-center gap-2"
                style={{ width: 'auto', padding: '0.55rem 1rem' }}>
          <Plus className="w-4 h-4" /> Add
        </button>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full pb-24 sm:pb-6">
        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input
              className="input-base pl-9"
              style={{ borderRadius: '12px' }}
              placeholder="Search by name or tag…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className="px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                style={filter === s
                  ? { background: 'linear-gradient(135deg,#c084fc,#818cf8)', color: '#fff', boxShadow: '0 0 14px rgba(192,132,252,0.4)', fontFamily: 'var(--font-display)' }
                  : { background: 'var(--color-raised)', color: 'var(--color-muted)', fontFamily: 'var(--font-display)', border: '1px solid var(--color-border)' }}>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 rounded-full border-4 anim-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: '#c084fc' }} />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((ship, i) => <SituationshipCard key={ship._id} ship={ship} index={i} />)}
          </div>
        ) : (
          <div className="glass flex flex-col items-center justify-center py-20 text-center">
            <SlidersHorizontal className="w-10 h-10 mb-4 opacity-20" />
            <p className="font-black text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              {search || filter ? 'No matches found.' : 'No connections yet.'}
            </p>
            {!search && !filter && (
              <button onClick={() => setIsAddOpen(true)} className="btn-primary mt-5" style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>
                <span className="flex items-center gap-2"><Plus className="w-4 h-4" />Add Someone</span>
              </button>
            )}
          </div>
        )}
      </main>
      <AddSituationship isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSubmit={handleAdd} />
    </div>
  );
};
