import { create } from 'zustand';

export const usePapersStore = create((set) => ({
  papers: [],
  isLoading: false,

  fetchPapers: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/papers');
      if (res.ok) {
        const data = await res.json();
        set({ papers: data, isLoading: false });
      }
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  deletePaper: async (id) => {
    try {
      await fetch(`/api/papers/${id}`, { method: 'DELETE' });
      set(state => ({
        papers: state.papers.filter(p => p.id !== id)
      }));
    } catch (err) {
      console.error(err);
    }
  }
}));
