import React from 'react';
import { useStore } from '../store/useStore';
import { streamExplanation } from '../services/gemini';
import { Slider } from '../components/Slider';
import { ExplanationBox } from '../components/ExplanationBox';
import { Flashcard } from '../components/Flashcard';
import { MindMapPreview } from '../components/MindMapPreview';
import { Brain, Wand2, ScrollText, LayoutTemplate, History, ShieldCheck, LogOut, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const interests = ['General (None)', 'Gaming', 'Cooking', 'Sports', 'Music', 'Programming', 'Movies'];

export const Dashboard: React.FC = () => {
  const { topic, setTopic, interest, setInterest, level, flashcards, isStreaming, currentUser } = useStore();
  const [inputValue, setInputValue] = React.useState(topic);
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const [isExplanationOpen, setIsExplanationOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setCurrentCardIndex(0);
  }, [topic, level, interest]);

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handler = () => setUserMenuOpen(false);
    if (userMenuOpen) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [userMenuOpen]);

  const handleExplain = () => {
    if (!inputValue.trim()) return;
    setTopic(inputValue);
    setIsExplanationOpen(true);
    streamExplanation(inputValue, level, interest);
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen p-6 md:p-8 flex flex-col mx-auto max-w-[1600px]">
      <ExplanationBox isOpen={isExplanationOpen} onClose={() => setIsExplanationOpen(false)} />

      <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        {/* Left: logo */}
        <div className="flex items-center gap-3">
          <Brain className="text-[#00f0ff]" size={32} />
          <h1 className="text-2xl font-black tracking-tighter neon-text">ExplainLikeAI</h1>
          <span className="ml-4 text-xs font-bold px-3 py-1 bg-white/5 rounded-full border border-white/10 tracking-widest text-gray-400">
            DASHBOARD
          </span>
        </div>

        {/* Right: nav links + user menu */}
        <div className="flex gap-4 items-center">
          {topic && !isStreaming && (
            <button
              onClick={() => setIsExplanationOpen(true)}
              className="text-sm font-semibold hover:text-[#00f0ff] transition-colors flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10"
            >
              <ScrollText size={16} /> Read Explainer
            </button>
          )}

          <Link
            to="/compare"
            className="text-sm font-semibold hover:text-[#8a2be2] transition-colors flex items-center gap-2 text-gray-400"
          >
            <LayoutTemplate size={16} /> Compare
          </Link>

          <Link
            to="/history"
            className="text-sm font-semibold hover:text-[#00f0ff] transition-colors flex items-center gap-2 text-gray-400"
          >
            <History size={16} /> History
          </Link>

          {currentUser?.role === 'admin' && (
            <Link
              to="/admin"
              className="text-sm font-semibold hover:text-[#8a2be2] transition-colors flex items-center gap-2 text-gray-400"
            >
              <ShieldCheck size={16} /> Admin
            </Link>
          )}

          {/* User menu */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setUserMenuOpen(o => !o)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl transition-all"
            >
              {/* Avatar circle */}
              <div className="w-6 h-6 rounded-full bg-[#8a2be2]/40 border border-[#8a2be2]/60 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {currentUser?.email?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="text-xs text-gray-300 max-w-[120px] truncate hidden md:block">
                {currentUser?.email}
              </span>
              {currentUser?.role === 'admin' && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[#8a2be2]/20 text-[#8a2be2] border border-[#8a2be2]/30 hidden md:block">
                  admin
                </span>
              )}
              <ChevronDown size={12} className="text-gray-500" />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 glass-panel py-2 z-50 border border-white/10 rounded-xl shadow-xl">
                {/* Email display */}
                <div className="px-4 py-2 border-b border-white/10 mb-1">
                  <div className="text-xs text-gray-500">Signed in as</div>
                  <div className="text-xs font-bold text-white truncate">{currentUser?.email}</div>
                  <div className="text-xs text-[#8a2be2] font-bold capitalize mt-0.5">{currentUser?.role}</div>
                </div>

                <Link
                  to="/history"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <History size={14} /> My History
                </Link>

                {currentUser?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <ShieldCheck size={14} /> Admin Panel
                  </Link>
                )}

                <div className="border-t border-white/10 mt-1 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Rest of dashboard — unchanged */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#00f0ff] to-[#8a2be2]" />

            <h2 className="text-2xl font-bold mb-2">What do you want to learn?</h2>
            <p className="text-sm text-gray-400 mb-6">Enter any concept and choose your tailored parameters.</p>

            <div className="flex gap-3 mb-8">
              <input
                type="text"
                placeholder="e.g. Quantum Entanglement..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
                className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all"
              />
              <button
                onClick={handleExplain}
                disabled={isStreaming}
                className="neon-button bg-[#1c1d29] border border-white/10 px-6 py-3 flex items-center justify-center gap-2 hover:border-[#00f0ff] disabled:opacity-50"
              >
                <Wand2 size={18} className="text-[#00f0ff] relative z-10" />
                <span className="relative z-10 text-white">Explain</span>
              </button>
            </div>

            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Dynamic Multi-Level Slider</h3>
            <Slider />

            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#8a2be2] mb-3">Interest context (Analogy)</h3>
              <div className="flex flex-wrap gap-2">
                {interests.map(i => (
                  <button
                    key={i}
                    onClick={() => setInterest(i)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 border
                      ${interest === i
                        ? 'bg-[#8a2be2]/20 border-[#8a2be2] text-[#8a2be2] shadow-[0_0_10px_rgba(138,43,226,0.3)]'
                        : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/20'}`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Flashcards */}
            <div className="glass-panel p-6 flex flex-col relative h-full min-h-[400px]">
              <div className="flex items-center gap-2 mb-6">
                <ScrollText className="text-[#ff0055]" size={20} />
                <h2 className="text-lg font-bold tracking-wider uppercase text-gray-200">Auto Flashcards</h2>
              </div>

              {flashcards.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                  <div className="w-24 h-24 mb-4 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center">
                    <ScrollText size={32} className="text-gray-600" />
                  </div>
                  <p className="text-sm max-w-[200px]">Waiting for an explanation to generate flashcards...</p>
                </div>
              ) : (
                <div className="relative w-full flex-1 flex flex-col items-center justify-center">
                  <Flashcard card={flashcards[currentCardIndex]} index={currentCardIndex} />
                  <div className="mt-8 flex items-center gap-6 bg-black/40 px-6 py-2 rounded-full border border-white/5">
                    <button
                      onClick={() => setCurrentCardIndex(p => Math.max(0, p - 1))}
                      disabled={currentCardIndex === 0}
                      className="text-gray-400 hover:text-[#00f0ff] disabled:opacity-30 transition-colors uppercase text-xs font-bold tracking-widest"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-bold tracking-widest text-[#ff0055] uppercase">
                      {currentCardIndex + 1} / {flashcards.length}
                    </span>
                    <button
                      onClick={() => setCurrentCardIndex(p => Math.min(flashcards.length - 1, p + 1))}
                      disabled={currentCardIndex === flashcards.length - 1}
                      className="text-gray-400 hover:text-[#00f0ff] disabled:opacity-30 transition-colors uppercase text-xs font-bold tracking-widest"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mind Map */}
            <div className="flex flex-col gap-6">
              <MindMapPreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
