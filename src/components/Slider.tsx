import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import type { Level } from '../store/useStore';

const levels: Level[] = ['Child', 'Teen', 'Beginner', 'Intermediate', 'Expert'];

export const Slider: React.FC = () => {
  const { level, setLevel } = useStore();
  const currentIndex = levels.indexOf(level);

  return (
    <div className="relative w-full py-8">
      <div className="flex justify-between relative z-10 w-full px-[12px]">
        {levels.map((lvl) => {
          const isSelected = level === lvl;
          return (
            <div
              key={lvl}
              onClick={() => setLevel(lvl)}
              className="flex flex-col items-center cursor-pointer group relative"
            >
              {/* The clickable Node */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${
                  isSelected
                    ? "bg-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.8)]"
                    : "bg-[#1c1d29] border-2 border-[#2a2b3d] group-hover:border-gray-500"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute w-10 h-10 rounded-full border border-[#00f0ff] opacity-50"
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}
              </div>
              
              {/* Label */}
              <span
                className={`mt-4 text-xs tracking-wider uppercase font-bold transition-all duration-300 absolute top-8 whitespace-nowrap ${
                  isSelected ? "text-[#00f0ff]" : "text-gray-500 group-hover:text-gray-300"
                }`}
              >
                {lvl}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Background Track line */}
      <div className="absolute top-11 left-0 right-0 h-1 bg-[#1c1d29] rounded-full mx-3" />
      
      {/* Filled Track line */}
      <motion.div 
        className="absolute top-11 left-3 h-1 bg-gradient-to-r from-[#8a2be2] to-[#00f0ff] rounded-full z-0"
        initial={{ width: 0 }}
        animate={{ width: `calc(${(currentIndex / (levels.length - 1)) * 100}% - 24px)` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    </div>
  );
};
