import React, { useEffect, useState } from 'react';
import { usePapersStore } from '../stores/papersStore';
import { useReviewStore } from '../stores/reviewStore';
import { Loader2, Zap, LayoutList, GitMerge, FileText } from 'lucide-react';

export default function Insights() {
  const { papers, fetchPapers } = usePapersStore();
  const { generateReview, isLoading, activeResult, activeType } = useReviewStore();
  
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [topic, setTopic] = useState('');

  useEffect(() => {
    fetchPapers();
  }, []);

  const togglePaper = (id) => {
    setSelectedPapers(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const renderResult = () => {
    if (!activeResult) return null;

    if (activeType === 'literature') {
      return (
        <div style={resultCardStyle}>
          <h3>{activeResult.title}</h3>
          <p><strong>Introduction:</strong> {activeResult.introduction}</p>
          <p><strong>Methodologies:</strong> {activeResult.methodologies}</p>
          <p><strong>Results:</strong> {activeResult.results}</p>
          <p><strong>Discussion:</strong> {activeResult.discussion}</p>
          <p><strong>Conclusion:</strong> {activeResult.conclusion}</p>
        </div>
      );
    }

    if (activeType === 'gaps') {
      return (
        <div style={resultCardStyle}>
          <h3>Research Gaps Identified</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeResult.gaps?.map((gap, i) => (
              <div key={i} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: gap.severity === 'High' ? '#fef2f2' : '#f9fafb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{gap.description}</strong>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '12px', background: gap.severity === 'High' ? '#fecaca' : '#fef08a' }}>
                    {gap.severity} Severity
                  </span>
                </div>
                <p style={{ fontSize: '14px', margin: '0.5rem 0' }}><strong>Approach:</strong> {gap.suggested_approach}</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Found via: {gap.related_papers.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeType === 'compare') {
      return (
        <div style={resultCardStyle}>
          <h3>Paper Comparison</h3>
          <p>{activeResult.overview}</p>
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={thStyle}>Dimension</th>
                  {activeResult.papers?.map((p, i) => <th key={i} style={thStyle}>{p.title}</th>)}
                </tr>
              </thead>
              <tbody>
                {activeResult.dimensions?.map((dim, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={tdStyle}><strong>{dim}</strong></td>
                    {activeResult.papers?.map((p, j) => (
                      <td key={j} style={tdStyle}>{p[dim]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: '1rem', background: '#eef2ff', padding: '1rem', borderRadius: '4px' }}>
            <strong>Recommendation:</strong> {activeResult.recommendation}
          </p>
        </div>
      );
    }
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Sidebar: Paper Selection */}
      <div style={{ width: '300px', background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
        <h3 style={{ marginTop: 0 }}>Select Papers</h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Choose papers to analyze ({selectedPapers.length} selected)</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
          {papers.filter(p => p.status === 'ready').map(paper => (
            <label key={paper.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '4px', background: selectedPapers.includes(paper.id) ? '#eef2ff' : '#fff' }}>
              <input 
                type="checkbox" 
                checked={selectedPapers.includes(paper.id)}
                onChange={() => togglePaper(paper.id)}
              />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{paper.title}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Main Content: Actions & Results */}
      <div style={{ flex: 1 }}>
        <h2 style={{ marginTop: 0 }}>AI Research Insights</h2>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Optional specific topic focus..." 
            value={topic} onChange={e => setTopic(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #d1d5db', flex: 1, minWidth: '200px' }}
          />
          <button 
            disabled={selectedPapers.length === 0 || isLoading}
            onClick={() => generateReview('literature', selectedPapers, topic)}
            style={btnStyle}
          >
            <FileText size={18} /> Lit Review
          </button>
          <button 
            disabled={selectedPapers.length === 0 || isLoading}
            onClick={() => generateReview('gaps', selectedPapers)}
            style={btnStyle}
          >
            <Zap size={18} /> Detect Gaps
          </button>
          <button 
            disabled={selectedPapers.length < 2 || isLoading}
            onClick={() => generateReview('compare', selectedPapers)}
            style={btnStyle}
            title="Requires at least 2 papers"
          >
            <GitMerge size={18} /> Compare
          </button>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', color: '#6b7280' }}>
            <Loader2 className="spinner" size={48} color="#4f46e5" style={{ marginBottom: '1rem' }} />
            <p>Synthesizing insights using Gemini 1.5 Flash... This may take a minute.</p>
          </div>
        ) : (
          renderResult()
        )}
      </div>

      <style>{`
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const btnStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: 1 };
const resultCardStyle = { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const thStyle = { padding: '0.75rem', textAlign: 'left', border: '1px solid #e5e7eb', fontWeight: 600 };
const tdStyle = { padding: '0.75rem', textAlign: 'left', border: '1px solid #e5e7eb', fontSize: '0.875rem' };
