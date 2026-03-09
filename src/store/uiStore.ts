// src/store/uiStore.ts
import { create } from "zustand";

interface UIStore {
  sidebarCollapsed: boolean;
  activeModal: string | null;

  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  activeModal: null,

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}));
