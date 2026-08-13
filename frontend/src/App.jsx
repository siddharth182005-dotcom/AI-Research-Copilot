import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Upload from './pages/Upload';
import Chat from './pages/Chat';
import Papers from './pages/Papers';
import Insights from './pages/Insights';
import { BookOpen, MessageSquare, UploadCloud, Lightbulb } from 'lucide-react';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* Sidebar */}
        <div style={{ width: '250px', background: '#111827', color: '#fff', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: '0 0 2rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
            <BookOpen size={24} color="#6366f1" /> Copilot
          </h2>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/" style={linkStyle}>
              <MessageSquare size={20} /> Chat
            </Link>
            <Link to="/upload" style={linkStyle}>
              <UploadCloud size={20} /> Upload
            </Link>
            <Link to="/papers" style={linkStyle}>
              <BookOpen size={20} /> Papers
            </Link>
            <Link to="/insights" style={linkStyle}>
              <Lightbulb size={20} /> Insights
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, backgroundColor: '#f3f4f6', overflowY: 'auto' }}>
          <header style={{ background: '#fff', padding: '1.5rem 2rem', borderBottom: '1px solid #e5e7eb' }}>
            <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>AI Research Intelligence</h1>
          </header>
          
          <main style={{ padding: '2rem' }}>
            <Routes>
              <Route path="/" element={<Chat />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/papers" element={<Papers />} />
              <Route path="/insights" element={<Insights />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  color: '#d1d5db',
  textDecoration: 'none',
  padding: '0.75rem 1rem',
  borderRadius: '6px',
  transition: 'background 0.2s',
  ':hover': { background: '#1f2937' } // Note: inline hover needs JS or styled-components, this is simplified
};

export default App;
