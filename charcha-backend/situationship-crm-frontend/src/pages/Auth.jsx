import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Flame, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Orb = ({ className }) => (
  <div className={`pointer-events-none absolute rounded-full blur-[120px] opacity-25 ${className}`} />
);

export const Auth = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [fields, setFields] = useState({ name: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const set = (key) => (e) => setFields(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = mode === 'login'
        ? await login(fields.email, fields.password)
        : await register(fields.name, fields.email, fields.password);
      if (result.success) navigate('/');
      else setError(result.message || 'Something went wrong');
    } catch {
      setError('Server error. Is the backend running?');
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center" 
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")' }}
      />
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to bottom, rgba(9,9,14,0.3), rgba(9,9,14,0.95))' }} />

      <div className="relative z-10 w-full max-w-sm mx-4 anim-fade-up">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
               style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(251,146,60,0.1))', border: '1px solid rgba(249,115,22,0.3)', boxShadow: '0 0 30px rgba(249,115,22,0.25)' }}>
            <Flame className="w-7 h-7" style={{ color: '#f97316' }} />
          </div>
          <h1 className="text-3xl font-black tracking-widest uppercase" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
            Context
          </h1>
          <p className="mt-2 text-sm text-center" style={{ color: 'var(--color-muted)' }}>
            Track your weak ties before they go cold.
          </p>
        </div>

        {/* Card */}
        <div 
          className="p-7 shadow-2xl rounded-3xl" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(20, 15, 10, 0.45) 0%, rgba(10, 5, 0, 0.65) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Tab switcher */}
          <div className="flex mb-6 p-1 rounded-xl gap-1" style={{ background: 'rgba(9,9,14,0.6)', border: '1px solid var(--color-border)' }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all duration-200"
                style={mode === m
                  ? { background: 'linear-gradient(135deg,#ea580c,#f97316)', color: '#fff', boxShadow: '0 2px 12px rgba(249,115,22,0.4)', fontFamily: 'var(--font-display)' }
                  : { color: 'var(--color-muted)', fontFamily: 'var(--font-display)' }}
              >
                {m}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
                 style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="anim-fade-up">
                <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-display)' }}>
                  Full Name
                </label>
                <input
                  className="input-base"
                  type="text"
                  placeholder="Nandini Sharma"
                  value={fields.name}
                  onChange={set('name')}
                  required={mode === 'register'}
                />
              </div>
            )}

            <div>
              <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-display)' }}>
                Email
              </label>
              <input
                className="input-base"
                type="email"
                placeholder="nandini@gmail.com"
                value={fields.email}
                onChange={set('email')}
                required
              />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-display)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  className="input-base pr-10"
                  type={showPwd ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'min. 6 characters' : 'Your secret password'}
                  value={fields.password}
                  onChange={set('password')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--color-text)' }}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 mt-2"
              style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', boxShadow: '0 0 28px rgba(234,88,12,0.35)' }}
            >
              {loading ? (
                <span className="flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white anim-bounce-1" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white anim-bounce-2" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white anim-bounce-3" />
                </span>
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {mode === 'login' && (
            <p className="mt-5 text-center text-xs" style={{ color: 'var(--color-ghost)' }}>
              No account?{' '}
              <button onClick={() => { setMode('register'); setError(''); }}
                      className="underline transition-colors"
                      style={{ color: 'var(--color-muted)' }}>
                Create one free →
              </button>
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: 'var(--color-ghost)' }}>
          Your data is private. You own your relationship graph.
        </p>
      </div>
    </div>
  );
};
