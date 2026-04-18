import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ModelStore {
  selectedModel: string;
  setModel: (model: string) => void;
}

export const useModelStore = create<ModelStore>()(
  persist(
    (set) => ({
      selectedModel: 'gpt-4o-mini',
      setModel: (model) => set({ selectedModel: model }),
    }),
    { name: 'ai-model-preference' },
  ),
);
