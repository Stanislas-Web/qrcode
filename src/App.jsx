import './App.css'
import QRScanner from './QRScanner'
import TestScanner from './TestScanner'
import { useState } from 'react'

function App() {
  const [mode, setMode] = useState('test'); // 'test' ou 'scan'

  return (
    <>
      <h1>QR Code Scanner - Inventaire</h1>
      
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'center', 
        marginBottom: '20px' 
      }}>
        <button
          onClick={() => setMode('test')}
          style={{
            padding: '10px 20px',
            backgroundColor: mode === 'test' ? '#4CAF50' : '#ddd',
            color: mode === 'test' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🧪 Mode Test
        </button>
        <button
          onClick={() => setMode('scan')}
          style={{
            padding: '10px 20px',
            backgroundColor: mode === 'scan' ? '#4CAF50' : '#ddd',
            color: mode === 'scan' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📷 Scanner QR
        </button>
      </div>

      {mode === 'test' ? <TestScanner /> : <QRScanner />}
    </>
  )
}

export default App
