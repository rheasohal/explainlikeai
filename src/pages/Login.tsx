import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUserProfile, getUserRole } from '../services/chatHistory';
import { useStore } from '../store/useStore';
import { BrainCircuit, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useStore();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let userCred;

      if (mode === 'signup') {
        userCred = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(userCred.user.uid, email);
      } else {
        userCred = await signInWithEmailAndPassword(auth, email, password);
      }

      const role = await getUserRole(userCred.user.uid);

      setCurrentUser({
        uid: userCred.user.uid,
        email: userCred.user.email,
        role,
      });

      navigate(role === 'admin' ? '/admin' : '/');
    } catch (err: any) {
      // Make Firebase errors readable
      const msg = err.code
        ?.replace('auth/', '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
      setError(msg || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0f0f1a' }}>
      {/* Background doodle dots */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #8a2be2 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#8a2be2]/20 border border-[#8a2be2]/40 mb-4">
            <BrainCircuit size={32} className="text-[#8a2be2]" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">ExplainWithAI</h1>
          <p className="text-gray-400 text-sm mt-2">Learn anything, at any level</p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8">
          {/* Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2.5 text-sm font-bold transition-all"
                style={{
                  background: mode === m ? '#8a2be2' : 'transparent',
                  color: mode === m ? 'white' : '#9ca3af',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#8a2be2]/60 focus:bg-white/8 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-[#8a2be2]/60 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-gray-600 mt-1.5">Minimum 6 characters</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="neon-button w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <LogIn size={16} />
              ) : (
                <UserPlus size={16} />
              )}
              <span className="relative z-10 text-white font-bold text-sm">
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </span>
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-xs text-gray-500 mt-5">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-[#8a2be2] hover:text-purple-400 font-bold transition-colors"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
