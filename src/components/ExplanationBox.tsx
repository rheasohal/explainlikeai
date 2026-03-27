import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useStore } from '../store/useStore';
import { X, Loader2, Download } from 'lucide-react';
import { downloadPdf } from '../utils/exportPdf';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ExplanationBox: React.FC<Props> = ({ isOpen, onClose }) => {
  const { isStreaming, explanationText } = useStore();

  if (!isOpen && !isStreaming) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/80 backdrop-blur-md">
      <div className="bg-[#13141c]/95 border border-[#00f0ff]/30 shadow-[0_0_50px_rgba(0,240,255,0.15)] rounded-2xl w-full max-w-5xl h-full max-h-[85vh] flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-gradient-to-r from-[#1c1d29] to-[#13141c]">
          <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] flex items-center gap-3">
            {isStreaming ? (
              <><Loader2 className="animate-spin text-[#00f0ff]" size={24} /> Generating Explanation...</>
            ) : (
              'Core Concept Explanation'
            )}
          </h2>
          
          <div className="flex items-center gap-4">
            {!isStreaming && explanationText && (
              <button 
                onClick={() => downloadPdf('ExplainLikeAI_Export')}
                className="text-sm font-semibold hover:text-[#00f0ff] transition-colors flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:border-[#00f0ff]/50"
              >
                <Download size={16} /> Export Content
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-[#ff0055] transition-colors p-2 rounded-full hover:bg-white/5 border border-transparent hover:border-[#ff0055]/30">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 md:p-10 overflow-y-auto scrollbar-thin scrollbar-thumb-[#00f0ff]/50 text-gray-300 text-lg leading-relaxed flex-1">
          {/* React Markdown injects standard HTML tags, our base index.css takes care of typography */}
          <div className="markdown-content space-y-4">
            <ReactMarkdown>
              {explanationText || '*Streaming mind-blowing simplifications...*'}
            </ReactMarkdown>
          </div>
        </div>
        
      </div>
    </div>
  );
};
