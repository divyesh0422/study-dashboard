// src/store/uiStore.ts
import { create } from "zustand";

interface UIStore {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  activeModal: string | null;

  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setMobileSidebarOpen: (v: boolean) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed:  false,
  mobileSidebarOpen: false,
  activeModal:       null,

  toggleSidebar:        () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed:  (v) => set({ sidebarCollapsed: v }),
  setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),
  openModal:            (id) => set({ activeModal: id }),
  closeModal:           () => set({ activeModal: null }),
}));
