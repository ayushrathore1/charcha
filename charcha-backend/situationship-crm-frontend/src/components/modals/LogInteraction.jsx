import React, { useState } from 'react';
import { X, Smile, Meh, Frown } from 'lucide-react';

const INT_TYPES = [
  'dm', 'comment', 'mention', 'irl_meet', 'call', 'collab', 'follow', 'react', 'manual'
];

export const LogInteraction = ({ isOpen, onClose, onSubmit, platform }) => {
  const [formData, setFormData] = useState({
    type: 'dm',
    platform: platform || 'instagram',
    sentiment: 'neutral',
    note: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ type: 'dm', platform: platform || 'instagram', sentiment: 'neutral', note: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0 animate-fade-in-up">
      <div className="bg-[#13131a] w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden animate-fade-in-up sm:translate-y-0"
           style={{ animationName: 'slideUp', animationDuration: '0.3s' }}>
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[#c084fc]/10">
          <h2 className="font-syne font-bold text-lg text-[#c084fc]">Log Interaction</h2>
          <button onClick={onClose} className="text-[#8b8a9e] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-xs text-[#8b8a9e] mb-2 uppercase font-bold tracking-wider">What happened?</label>
            <div className="grid grid-cols-3 gap-2">
              {INT_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({...formData, type: t})}
                  className={`py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all border ${
                    formData.type === t ? 'bg-white text-black border-transparent shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-[#1c1c28] text-[#8b8a9e] border-transparent hover:border-[var(--border)]'
                  }`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#8b8a9e] mb-2 uppercase font-bold tracking-wider">Sentiment / Vibe</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setFormData({...formData, sentiment: 'positive'})}
                className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 border transition-all ${
                  formData.sentiment === 'positive' ? 'bg-[#ff4d1a]/20 border-[#ff4d1a]/50 text-[#ff4d1a]' : 'bg-[#1c1c28] border-transparent text-[#8b8a9e]'
                }`}>
                <Smile className="w-5 h-5" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Great</span>
              </button>
              <button type="button" onClick={() => setFormData({...formData, sentiment: 'neutral'})}
                className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 border transition-all ${
                  formData.sentiment === 'neutral' ? 'bg-[#4db8ff]/20 border-[#4db8ff]/50 text-[#4db8ff]' : 'bg-[#1c1c28] border-transparent text-[#8b8a9e]'
                }`}>
                <Meh className="w-5 h-5" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Neutral</span>
              </button>
              <button type="button" onClick={() => setFormData({...formData, sentiment: 'negative'})}
                className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 border transition-all ${
                  formData.sentiment === 'negative' ? 'bg-[#1e4d6b]/40 border-[#1e4d6b] text-[#4db8ff]' : 'bg-[#1c1c28] border-transparent text-[#8b8a9e]'
                }`}>
                <Frown className="w-5 h-5" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Cold</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#8b8a9e] mb-1.5 uppercase font-bold tracking-wider">Quick Note</label>
            <textarea 
              value={formData.note}
              onChange={e => setFormData({...formData, note: e.target.value})}
              placeholder="They replied and asked about my project..."
              rows={2}
              className="w-full bg-[#0a0a0f] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#c084fc] transition-colors resize-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3 rounded-xl bg-[#c084fc] text-black font-syne font-bold hover:bg-[#a855f7] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_var(--accent-glow)]"
          >
            Add Heat
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}} />
    </div>
  );
};
