import { create } from 'zustand';

export const useReviewStore = create((set) => ({
  isLoading: false,
  activeResult: null,
  activeType: null,

  generateReview: async (type, paperIds, topic = '') => {
    set({ isLoading: true, activeResult: null, activeType: type });
    try {
      const endpoint = {
        'literature': '/api/review/literature',
        'gaps': '/api/review/gaps',
        'compare': '/api/review/compare'
      }[type];

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperIds, topic })
      });

      if (!res.ok) throw new Error('Failed to generate insights');
      const data = await res.json();
      
      set({ activeResult: data, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },
  
  clearResult: () => set({ activeResult: null, activeType: null })
}));
