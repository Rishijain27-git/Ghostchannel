/**
 * GhostChannel Panic Store
 * Global state for panic mode using Zustand
 * Triggering panic wipes all state and redirects to innocent page
 */

import { create } from 'zustand';

interface PanicState {
  isPanicking: boolean;
  triggerPanic: () => void;
  resetPanic: () => void;
}

export const usePanicStore = create<PanicState>((set) => ({
  isPanicking: false,

  triggerPanic: () => {
    set({ isPanicking: true });

    // Clear all session storage
    try {
      sessionStorage.clear();
    } catch {
      // Ignore if sessionStorage is not available
    }

    // Replace browser history so Back button doesn't return to sensitive pages
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/gallery');
      // Force full page redirect to gallery (innocent-looking page)
      window.location.href = '/gallery';
    }
  },

  resetPanic: () => {
    set({ isPanicking: false });
  },
}));

/**
 * Standalone panic trigger function (for use outside React components)
 */
export function triggerPanic(): void {
  usePanicStore.getState().triggerPanic();
}
