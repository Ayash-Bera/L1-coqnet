import { useState, useEffect } from 'react'

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...')

  useEffect(() => {
    fetch('http://localhost:3001/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data.message))
      .catch(() => setBackendStatus('Backend not connected'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          🚀 Coqnet Explorer
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Setup Status</h2>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Frontend: Running on http://localhost:5173</span>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`w-3 h-3 rounded-full ${backendStatus.includes('running') ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
              <span>Backend: {backendStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App