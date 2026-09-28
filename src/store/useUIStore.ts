// ---------------------------------------------------------------------
// store/useUIStore.ts
// UI-only state: theme and the active tool. Deliberately excludes
// anything document-related (that's useDocumentStore's job) so the two
// stores never fight over the same state.
// ---------------------------------------------------------------------

import { create } from 'zustand';

export type Theme = 'dark' | 'light';

interface UIStoreState {
  theme: Theme;
  activeTool: string;
  setTheme(theme: Theme): void;
  toggleTheme(): void;
  setActiveTool(toolId: string): void;
}

export const useUIStore = create<UIStoreState>((set, get) => ({
  theme: 'dark',
  activeTool: 'move',
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
  setActiveTool: (toolId) => set({ activeTool: toolId }),
}));
