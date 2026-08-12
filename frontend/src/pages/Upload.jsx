import React, { useRef } from 'react';
import { useUploadStore } from '../stores/uploadStore';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function Upload() {
  const fileInput = useRef(null);
  const { uploadFile, isUploading, status, error } = useUploadStore();

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelect = (e) => {
    if (e.target.files?.length) {
      uploadFile(e.target.files[0]);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Upload Research Paper</h2>
      
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '4rem 2rem',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          opacity: isUploading ? 0.6 : 1
        }}
        onClick={() => !isUploading && fileInput.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInput} 
          style={{ display: 'none' }} 
          accept="application/pdf"
          onChange={handleSelect}
        />
        <UploadCloud size={48} color="#666" style={{ marginBottom: '1rem' }} />
        <h3>Drag & drop a PDF here</h3>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>or click to select file (Max 50MB)</p>
      </div>

      {isUploading && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#eef2ff', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Loader2 className="spinner" size={24} color="#4f46e5" />
          <div>
            <h4 style={{ margin: 0, color: '#4f46e5' }}>Processing Document</h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6366f1' }}>Extracting text, chunking, and embedding with Gemini...</p>
          </div>
        </div>
      )}

      {status === 'ready' && !isUploading && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0fdf4', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', color: '#166534' }}>
          <CheckCircle2 size={24} />
          <h4 style={{ margin: 0 }}>Upload complete! Document is ready for chat.</h4>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fef2f2', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', color: '#991b1b' }}>
          <AlertCircle size={24} />
          <h4 style={{ margin: 0 }}>Error: {error}</h4>
        </div>
      )}

      <style>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
