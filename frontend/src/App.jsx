import { useState, useEffect } from 'react'

function App() {
  const [status, setStatus] = useState('Loading...')

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setStatus(`Backend connected: ${data.status}`))
      .catch(err => setStatus('Backend disconnected'))
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>AI Research Copilot</h1>
      <p>Frontend initialized successfully.</p>
      <p>Status: {status}</p>
    </div>
  )
}

export default App
