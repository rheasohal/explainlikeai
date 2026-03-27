import { create } from 'zustand'

export type Level = 'Child' | 'Teen' | 'Beginner' | 'Intermediate' | 'Expert';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  rating?: 'Got it' | 'Almost' | 'Missed it';
}

export interface MindMapNode {
  id: string;
  label: string;
  parentId: string | null;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface AppState {
  topic: string;
  setTopic: (topic: string) => void;
  
  level: Level;
  setLevel: (level: Level) => void;
  
  interest: string;
  setInterest: (interest: string) => void;
  
  explanationText: string;
  setExplanationText: (text: string) => void;
  
  isStreaming: boolean;
  setIsStreaming: (stream: boolean) => void;
  
  flashcards: Flashcard[];
  setFlashcards: (cards: Flashcard[]) => void;
  updateFlashcardRating: (id: string, rating: Flashcard['rating']) => void;
  
  relatedConcepts: MindMapNode[];
  setRelatedConcepts: (concepts: MindMapNode[]) => void;
  
  chatHistory: Message[];
  addMessage: (msg: Message) => void;
  
  resetSession: () => void;
}

export const useStore = create<AppState>((set) => ({
  topic: '',
  setTopic: (topic) => set({ topic }),
  
  level: 'Beginner',
  setLevel: (level) => set({ level }),
  
  interest: 'General (None)',
  setInterest: (interest) => set({ interest }),
  
  explanationText: '',
  setExplanationText: (text) => set({ explanationText: text }),
  
  isStreaming: false,
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  
  flashcards: [],
  setFlashcards: (flashcards) => set({ flashcards }),
  updateFlashcardRating: (id, rating) => set((state) => ({
    flashcards: state.flashcards.map(card => 
      card.id === id ? { ...card, rating } : card
    )
  })),
  
  relatedConcepts: [],
  setRelatedConcepts: (relatedConcepts) => set({ relatedConcepts }),
  
  chatHistory: [],
  addMessage: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
  
  resetSession: () => set({
    explanationText: '',
    flashcards: [],
    chatHistory: [],
    isStreaming: false
  })
}))
