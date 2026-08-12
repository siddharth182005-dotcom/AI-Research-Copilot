import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  messages: [],
  isLoading: false,
  sessionId: null,

  sendMessage: async (text, paperIds = []) => {
    // Optimistic UI update
    const userMsg = { role: 'user', content: text, sources: [] };
    set(state => ({ messages: [...state.messages, userMsg], isLoading: true }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text, 
          sessionId: get().sessionId,
          paperIds 
        })
      });

      if (!res.ok) throw new Error('Chat API failed');
      const data = await res.json();
      
      const assistantMsg = { 
        role: 'assistant', 
        content: data.answer, 
        sources: data.sources 
      };

      set(state => ({ 
        messages: [...state.messages, assistantMsg],
        sessionId: data.sessionId,
        isLoading: false
      }));
    } catch (err) {
      set({ isLoading: false });
      // In a real app we'd show a toast error here
      console.error(err);
    }
  },
  
  clearChat: () => set({ messages: [], sessionId: null })
}));
