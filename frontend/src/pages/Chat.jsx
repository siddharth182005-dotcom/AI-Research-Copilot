import React, { useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import { Send, Bot, User, FileText } from 'lucide-react';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, isLoading, sendMessage } = useChatStore();

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1rem' }}>RAG Research Chat</h2>
      
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '1rem', 
        background: '#fff', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', color: '#888', textAlign: 'center' }}>
            <Bot size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p>Ask a question about your uploaded research papers.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '1rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '50%', 
                background: msg.role === 'user' ? '#4f46e5' : '#10b981',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
              }}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div style={{ 
                maxWidth: '75%', 
                background: msg.role === 'user' ? '#eef2ff' : '#f0fdf4', 
                padding: '1rem', borderRadius: '8px',
                border: '1px solid',
                borderColor: msg.role === 'user' ? '#c7d2fe' : '#bbf7d0'
              }}>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{msg.content}</div>
                
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid #d1fae5', paddingTop: '0.5rem' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#166534', marginBottom: '0.5rem' }}>Citations used:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {msg.sources.map(src => (
                        <details key={src.id} style={{ fontSize: '0.8rem', background: '#fff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                          <summary style={{ cursor: 'pointer', fontWeight: 500, color: '#374151' }}>
                            [Source {src.id}] {src.paper_title} <span style={{ color: '#6b7280' }}>({src.section})</span>
                          </summary>
                          <p style={{ marginTop: '0.5rem', color: '#4b5563', fontStyle: 'italic' }}>"{src.content}"</p>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div style={{ display: 'flex', gap: '1rem', opacity: 0.7 }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Bot size={20} />
              </div>
              <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px' }}>
                Generating response...
              </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question..." 
          style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          style={{ padding: '0 1.5rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Send size={20} /> Send
        </button>
      </form>
    </div>
  );
}
