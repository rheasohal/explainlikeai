import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import type { Flashcard as FlashcardType } from '../store/useStore';
import { Check, X, Minus } from 'lucide-react';

interface Props {
  card: FlashcardType;
  index: number;
  onRate?: () => void;
}

export const Flashcard: React.FC<Props> = ({ card, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const updateRating = useStore((state) => state.updateFlashcardRating);

  return (
    <div className="relative w-full h-72" style={{ perspective: 1000 }}>
      <motion.div
        className="w-full h-full relative cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div 
          className="absolute w-full h-full glass-panel p-6 flex flex-col justify-center items-center text-center border-t-2 border-t-[#00f0ff]"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-xs text-[#00f0ff]/70 absolute top-4 left-4 uppercase font-bold tracking-widest">Card {index + 1}</span>
          <h3 className="text-xl font-bold tracking-wide">{card.front}</h3>
          <span className="absolute bottom-4 text-xs text-gray-500 animate-pulse">Click to flip</span>
        </div>

        {/* Back */}
        <div 
          className="absolute w-full h-full glass-panel p-6 flex flex-col justify-center items-center text-center border-t-2 border-t-[#8a2be2]"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="text-xs text-[#8a2be2]/70 absolute top-4 left-4 uppercase font-bold tracking-widest">Answer</span>
          <p className="text-md text-gray-300 leading-relaxed overflow-y-auto mb-10 mt-6 scrollbar-thin scrollbar-thumb-white/10">{card.back}</p>
          
          <div className="absolute bottom-4 flex gap-4 w-full justify-center" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => updateRating(card.id, 'Missed it')}
              className={`p-2 rounded-full border transition-all ${card.rating === 'Missed it' ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-gray-600/50 text-gray-500 hover:text-red-400 hover:border-red-400 bg-black/40'}`}
              title="Missed It"
            >
              <X size={16} />
            </button>
            <button 
              onClick={() => updateRating(card.id, 'Almost')}
              className={`p-2 rounded-full border transition-all ${card.rating === 'Almost' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'border-gray-600/50 text-gray-500 hover:text-yellow-400 hover:border-yellow-400 bg-black/40'}`}
              title="Almost"
            >
              <Minus size={16} />
            </button>
            <button 
              onClick={() => updateRating(card.id, 'Got it')}
              className={`p-2 rounded-full border transition-all ${card.rating === 'Got it' ? 'bg-green-500/20 border-green-500 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'border-gray-600/50 text-gray-500 hover:text-green-400 hover:border-green-400 bg-black/40'}`}
              title="Got It"
            >
              <Check size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
