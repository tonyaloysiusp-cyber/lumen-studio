// ---------------------------------------------------------------------
// store/useUIStore.ts
// UI-only state: theme, the active tool, and (Phase 2) which right-dock
// tab is showing and whether the dock itself is visible. Deliberately
// excludes anything document-related (that's useDocumentStore's job) so
// the two stores never fight over the same state.
// ---------------------------------------------------------------------

import { create } from 'zustand';

export type Theme = 'dark' | 'light';
export type DockTab = 'layers' | 'history';

interface UIStoreState {
  theme: Theme;
  activeTool: string;
  dockVisible: boolean;
  activeDockTab: DockTab;
  setTheme(theme: Theme): void;
  toggleTheme(): void;
  setActiveTool(toolId: string): void;
  toggleDockVisible(): void;
  setActiveDockTab(tab: DockTab): void;
}

export const useUIStore = create<UIStoreState>((set, get) => ({
  theme: 'dark',
  activeTool: 'move',
  dockVisible: true,
  activeDockTab: 'layers',
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
  setActiveTool: (toolId) => set({ activeTool: toolId }),
  toggleDockVisible: () => set({ dockVisible: !get().dockVisible }),
  setActiveDockTab: (tab) => set({ activeDockTab: tab, dockVisible: true }),
}));
