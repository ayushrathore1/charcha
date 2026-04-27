import React, { useState } from 'react';
import { X, Instagram, Twitter, Linkedin, Users, Gamepad2, Sparkles } from 'lucide-react';

const PLATFORMS = [
  { id: 'instagram', icon: Instagram, label: 'IG' },
  { id: 'twitter', icon: Twitter, label: 'X' },
  { id: 'linkedin', icon: Linkedin, label: 'IN' },
  { id: 'irl', icon: Users, label: 'IRL' },
  { id: 'discord', icon: Gamepad2, label: 'DC' },
  { id: 'other', icon: Sparkles, label: 'Oth' },
];

export const AddSituationship = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    platform: 'instagram',
    notes: '',
    tags: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    onSubmit({
      person: {
        ...formData,
        tags: tagsArray
      }
    });
    setFormData({ name: '', handle: '', platform: 'instagram', notes: '', tags: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0 animate-fade-in-up">
      <div className="bg-[#13131a] w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden animate-fade-in-up sm:translate-y-0"
           style={{ animationName: 'slideUp', animationDuration: '0.3s' }}>
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="font-syne font-bold text-lg">Add New Connection</h2>
          <button onClick={onClose} className="text-[#8b8a9e] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-[#8b8a9e] mb-1.5 uppercase font-bold tracking-wider">Name</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Alex Chen"
              className="w-full bg-[#0a0a0f] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#c084fc] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-[#8b8a9e] mb-2 uppercase font-bold tracking-wider">Platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => {
                const Icon = p.icon;
                const active = formData.platform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({...formData, platform: p.id})}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      active ? 'bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/50' : 'bg-[#1c1c28] text-[#8b8a9e] border-transparent hover:border-[var(--border)]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#8b8a9e] mb-1.5 uppercase font-bold tracking-wider">Handle / URL</label>
            <input 
              type="text" 
              value={formData.handle}
              onChange={e => setFormData({...formData, handle: e.target.value})}
              placeholder="@alexchen or url"
              className="w-full bg-[#0a0a0f] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#c084fc] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-[#8b8a9e] mb-1.5 uppercase font-bold tracking-wider">Tags (comma separated)</label>
            <input 
              type="text" 
              value={formData.tags}
              onChange={e => setFormData({...formData, tags: e.target.value})}
              placeholder="founder, designer, e-cell"
              className="w-full bg-[#0a0a0f] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#c084fc] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-[#8b8a9e] mb-1.5 uppercase font-bold tracking-wider">Notes Context</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Met at hackathon, they are building an AI tool..."
              rows={3}
              className="w-full bg-[#0a0a0f] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#c084fc] transition-colors resize-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3 rounded-xl bg-white text-black font-syne font-bold hover:bg-gray-200 transition-colors mt-2"
          >
            Start Tracking
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
