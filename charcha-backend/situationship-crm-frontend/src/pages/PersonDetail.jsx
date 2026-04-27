import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { situationshipApi } from '../api/situationships';
import { format, formatDistanceToNow } from 'date-fns';
import { ArrowLeft, MessageSquare, Zap, Flame, Snowflake, Plus } from 'lucide-react';
import { LogInteraction } from '../components/modals/LogInteraction';

const SENTIMENT_STYLES = {
  positive: { color: '#ff6b3d', bg: '#ff6b3d22', Icon: Flame },
  neutral:  { color: '#4db8ff', bg: '#4db8ff22', Icon: MessageSquare },
  negative: { color: '#5899be', bg: '#1e4d6b33', Icon: Snowflake },
};

const WarmthBar = ({ score }) => {
  const glow = score >= 80 ? 'warmth-glow-hot' : score >= 60 ? 'warmth-glow-warm' : score >= 30 ? 'warmth-glow-cooling' : score >= 10 ? 'warmth-glow-cold' : 'warmth-glow-frozen';
  return (
    <div className="warmth-bar-track" style={{ height: 8 }}>
      <div className={`warmth-bar-fill ${glow}`} style={{ width: `${score}%` }} />
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const cls = { warm: 'badge-warm', cooling: 'badge-cooling', cold: 'badge-cold', frozen: 'badge-frozen' };
  return <span className={`badge-status ${cls[status] || 'badge-frozen'}`}>{status}</span>;
};

export const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [nudging, setNudging] = useState(false);

  const load = async () => {
    try {
      const res = await situationshipApi.getOne(id);
      if (res.success) setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleLog = async (payload) => {
    try {
      await situationshipApi.logInteraction(id, payload);
      setIsLogOpen(false);
      load();
    } catch (e) { console.error(e); }
  };

  const handleNudge = async () => {
    setNudging(true);
    try { await situationshipApi.generateNudge(id); navigate('/nudges'); }
    catch (e) { console.error(e); }
    finally { setNudging(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 rounded-full border-4 anim-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: '#c084fc' }} />
    </div>
  );
  if (!data) return <div className="p-8 text-center" style={{ color: 'var(--color-muted)' }}>Not found.</div>;

  return (
    <div className="flex flex-col min-h-screen" style={{ color: 'var(--color-text)' }}>
      <header className="sticky top-0 z-30 px-6 flex items-center gap-4 h-[72px]"
              style={{ background: 'rgba(9,9,14,0.8)', borderBottom: '1px solid var(--color-border)', backdropFilter: 'blur(12px)' }}>
        <button onClick={() => navigate('/people')} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors btn-ghost">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-lg truncate" style={{ fontFamily: 'var(--font-display)' }}>{data.person.name}</h1>
        </div>
        <StatusBadge status={data.status} />
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full pb-24 sm:pb-6 grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left panel */}
        <div className="space-y-4">
          <div className="glass p-6 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-4"
                 style={{ background: 'var(--color-raised)', fontFamily: 'var(--font-display)', border: '2px solid var(--color-border)' }}>
              {data.person.name.charAt(0).toUpperCase()}
            </div>
            <p className="font-black text-xl mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>{data.person.name}</p>
            {data.person.handle && <p className="text-sm mb-3" style={{ color: 'var(--color-muted)' }}>{data.person.handle}</p>}

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--color-ghost)', fontFamily: 'var(--font-display)' }}>
                <span className="font-bold uppercase tracking-wider">Warmth</span>
                <span className="font-black">{Math.round(data.warmthScore)}°</span>
              </div>
              <WarmthBar score={data.warmthScore} />
            </div>

            {data.person.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                {data.person.tags.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                        style={{ background: 'var(--color-raised)', color: 'var(--color-muted)', fontFamily: 'var(--font-display)', border: '1px solid var(--color-border)' }}>
                    {t}
                  </span>
                ))}
              </div>
            )}

            {data.person.notes && (
              <p className="text-sm text-left p-3 rounded-xl mb-4" style={{ color: 'var(--color-muted)', background: 'var(--color-raised)', border: '1px solid var(--color-border)', lineHeight: 1.6 }}>
                {data.person.notes}
              </p>
            )}

            <button onClick={handleNudge} disabled={nudging}
              className="btn-primary flex items-center justify-center gap-2">
              {nudging ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-white anim-bounce-1" /><span className="w-1.5 h-1.5 rounded-full bg-white anim-bounce-2" /><span className="w-1.5 h-1.5 rounded-full bg-white anim-bounce-3" /></>
              ) : (
                <><Zap className="w-4 h-4" />Generate AI Nudge</>
              )}
            </button>
          </div>
        </div>

        {/* Right panel — Timeline */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-black text-lg uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>Timeline</h2>
            <button onClick={() => setIsLogOpen(true)} className="btn-ghost flex items-center gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />Log Event
            </button>
          </div>

          <div className="glass overflow-hidden">
            {data.interactions?.length > 0 ? (
              <div className="timeline-line p-6 ml-3 space-y-8">
                {data.interactions.map((int, i) => {
                  const { color, bg, Icon } = SENTIMENT_STYLES[int.sentiment] || SENTIMENT_STYLES.neutral;
                  return (
                    <div key={int._id} className="relative pl-8 anim-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="timeline-dot" style={{ background: bg, color, top: 2 }}>
                        <Icon className="w-2.5 h-2.5" />
                      </div>
                      <div className="p-3 rounded-xl transition-colors"
                           style={{ background: 'var(--color-raised)', border: '1px solid var(--color-border)' }}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-black uppercase tracking-wider" style={{ color, fontFamily: 'var(--font-display)' }}>
                            {int.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--color-ghost)' }}>
                            {format(new Date(int.date), 'MMM d, yy')}
                          </span>
                        </div>
                        {int.note && <p className="text-sm" style={{ color: 'var(--color-muted)', lineHeight: 1.5 }}>{int.note}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
                <p className="font-black text-base mb-1" style={{ fontFamily: 'var(--font-display)' }}>No events yet</p>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Log your first interaction to start the timeline.</p>
                <button onClick={() => setIsLogOpen(true)} className="btn-ghost mt-4 flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" />Log First Event
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <LogInteraction isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} onSubmit={handleLog} platform={data.person.platform} />
    </div>
  );
};
