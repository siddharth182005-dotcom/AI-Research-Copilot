import { create } from 'zustand';

export const useUploadStore = create((set, get) => ({
  isUploading: false,
  status: null,
  paperId: null,
  error: null,
  
  uploadFile: async (file) => {
    set({ isUploading: true, status: 'processing', error: null });
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      set({ paperId: data.paperId });
      get().pollStatus(data.paperId);
    } catch (err) {
      set({ isUploading: false, error: err.message, status: 'error' });
    }
  },

  pollStatus: async (paperId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/upload/status/${paperId}`);
        const data = await res.json();
        
        set({ status: data.status });
        
        if (data.status === 'ready' || data.status === 'error') {
          clearInterval(interval);
          set({ isUploading: false });
        }
      } catch (err) {
        clearInterval(interval);
        set({ isUploading: false, error: 'Polling failed', status: 'error' });
      }
    }, 2000);
  }
}));
