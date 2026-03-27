import React, { useMemo } from 'react';
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../store/useStore';

export const MindMapPreview: React.FC = () => {
  const { topic, relatedConcepts } = useStore();

  // For the hackathon demo, we generate a static radial layout based on the topic.
  // We feed the dynamically generated 'relatedConcepts' directly into the nodes.
  
  // Construct dynamic Nodes from AI response or fallback to core topic
  const initialNodes = useMemo(() => {
    if (!relatedConcepts || relatedConcepts.length === 0) {
      return [
        { id: '1', position: { x: 250, y: 150 }, data: { label: topic || 'Core Concept' }, type: 'input', className: 'bg-[#1c1d29] border-[#00f0ff] text-white shadow-[0_0_15px_rgba(0,240,255,0.3)] min-w-[150px] text-center font-bold px-4 py-3 rounded-xl' },
      ];
    }
    
    // Auto-layout mapping for up to 7 nodes radially
    const radius = 180;
    const center = { x: 250, y: 250 };
    
    return relatedConcepts.map((concept, i) => {
      if (concept.id === "1" || !concept.parentId) {
        return {
          id: concept.id,
          position: center,
          data: { label: concept.label },
          className: 'bg-[#1c1d29] border-[#00f0ff] text-white shadow-[0_0_15px_rgba(0,240,255,0.3)] min-w-[150px] text-center font-bold px-4 py-3 rounded-xl'
        };
      }
      
      const angle = (i / (relatedConcepts.length - 1)) * 2 * Math.PI;
      return {
        id: concept.id,
        position: {
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle)
        },
        data: { label: concept.label },
        className: 'bg-[#13141c]/90 border border-gray-600 text-[#00f0ff] font-semibold rounded-lg px-4 py-2 text-sm shadow-[0_0_10px_rgba(0,0,0,0.5)]'
      };
    });
  }, [topic, relatedConcepts]);

  const initialEdges = useMemo(() => {
    if (!relatedConcepts || relatedConcepts.length === 0) return [];
    
    return relatedConcepts
      .filter(c => c.parentId && c.id !== "1")
      .map((concept) => ({
        id: `e${concept.parentId}-${concept.id}`,
        source: String(concept.parentId),
        target: String(concept.id),
        animated: true,
        style: { stroke: '#00f0ff', strokeWidth: 2, opacity: 0.6 }
      }));
  }, [relatedConcepts]);

  if (!topic) return null;

  return (
    <div className="w-full h-[300px] relative glass-panel border-t-2 border-t-[#8a2be2] mt-6 overflow-hidden">
      <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/50 backdrop-blur rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest text-[#8a2be2]">
        Concept Map
      </div>
      <ReactFlow nodes={initialNodes} edges={initialEdges} fitView attributionPosition="bottom-right" colorMode="dark">
        <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="#ffffff10" />
      </ReactFlow>
    </div>
  );
};
