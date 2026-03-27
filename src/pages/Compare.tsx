import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutTemplate, ArrowLeft } from 'lucide-react';

export const Compare: React.FC = () => {
  return (
    <div className="min-h-screen p-6 md:p-8 flex flex-col mx-auto max-w-[1600px]">
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors mr-2">
            <ArrowLeft size={20} className="text-gray-400" />
          </Link>
          <LayoutTemplate className="text-[#8a2be2]" size={32} />
          <h1 className="text-xl font-bold tracking-tight text-white">Compare Modes</h1>
          <span className="ml-4 text-xs font-bold px-3 py-1 bg-[#8a2be2]/20 text-[#8a2be2] rounded-full border border-[#8a2be2]/50 tracking-widest">PRO FEATURE</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center">
        <div className="glass-panel p-12 text-center max-w-xl">
           <LayoutTemplate size={48} className="mx-auto text-gray-500 mb-6" />
           <h2 className="text-2xl font-bold mb-4">Side-by-Side Compare Mode</h2>
           <p className="text-gray-400 mb-8">This feature is scoped for the final hackathon deployment. It will allow simultaneous streaming of a "Child" explanation alongside an "Expert" explanation for the same topic to instantly visualize the delta in language and complexity.</p>
           
           <Link to="/" className="inline-block neon-button bg-[#1c1d29] px-6 py-3 border border-[#8a2be2]">
              <span className="relative z-10 text-white">Return to Dashboard</span>
           </Link>
        </div>
      </div>
    </div>
  );
};
