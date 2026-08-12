import React, { useEffect } from 'react';
import { usePapersStore } from '../stores/papersStore';
import { FileText, Trash2, Loader2, Clock, CheckCircle } from 'lucide-react';

export default function Papers() {
  const { papers, isLoading, fetchPapers, deletePaper } = usePapersStore();

  useEffect(() => {
    fetchPapers();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>My Research Papers</h2>
        <button onClick={fetchPapers} style={{ padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px', border: '1px solid #d1d5db', background: '#fff' }}>
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 className="spinner" size={32} color="#4f46e5" />
        </div>
      ) : papers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#f9fafb', borderRadius: '8px', color: '#6b7280' }}>
          <FileText size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h3>No papers uploaded yet</h3>
          <p>Go to the Upload tab to add some research papers.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {papers.map(paper => (
            <div key={paper.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>{paper.title || 'Untitled Document'}</h4>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ color: paper.status === 'ready' ? '#10b981' : '#f59e0b' }}>
                      {paper.status === 'ready' ? <CheckCircle size={16} /> : <Clock size={16} />}
                    </span>
                    Status: {paper.status}
                  </span>
                  <span>ID: {paper.id.substring(0, 8)}...</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this paper and all its data?')) {
                    deletePaper(paper.id);
                  }
                }}
                style={{ padding: '0.5rem', color: '#ef4444', background: 'transparent', border: '1px solid #fee2e2', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Delete Paper"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
      <style>{`
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
