import React, { useState, useEffect, useCallback } from 'react'
import { useAIMessage } from '../context/AIMessageContext'

/**
 * IntegrationPanel Component
 * Provides UI for quantum integrations:
 * - IBM Quantum Experience connection
 * - Qiskit circuit execution
 * - Export to Q#/QASM/Braket
 * - Share circuits
 */

const API_BASE = '/api'

// Integration status hook
const useIntegrationStatus = () => {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/integration/status`)
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch integration status:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return { status, loading, refetch: fetchStatus }
}

// Backend list hook
const useIBMBackends = () => {
  const [backends, setBackends] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBackends = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/integration/backends`)
      if (response.ok) {
        const data = await response.json()
        setBackends(data.backends || [])
      }
    } catch (error) {
      console.error('Failed to fetch backends:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBackends()
  }, [fetchBackends])

  return { backends, loading, refetch: fetchBackends }
}

// Integration Status Display
const StatusCard = ({ status }) => {
  if (!status) return null

  return (
    <div className="integration-status-card">
      <h4>Integration Status</h4>
      <div className="status-grid">
        <div className="status-item">
          <span className="status-label">Qiskit Available</span>
          <span className={`status-value ${status.qiskit_available ? 'active' : 'inactive'}`}>
            {status.qiskit_available ? '✓' : '✗'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">IBM Runtime</span>
          <span className={`status-value ${status.ibm_runtime_available ? 'active' : 'inactive'}`}>
            {status.ibm_runtime_available ? '✓' : '✗'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">IBM Credentials</span>
          <span className={`status-value ${status.ibm_credentials_configured ? 'active' : 'warning'}`}>
            {status.ibm_credentials_configured ? '✓ Configured' : '⚠ Not Set'}
          </span>
        </div>
      </div>
      
      <div className="features-list">
        <h5>Available Features:</h5>
        <ul>
          {Object.entries(status.features || {}).map(([key, value]) => (
            <li key={key} className={value ? 'enabled' : 'disabled'}>
              <span className="feature-icon">{value ? '✓' : '✗'}</span>
              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// IBM Backends List
const BackendsList = ({ backends, loading }) => {
  if (loading) return <div className="loading-backends">Loading backends...</div>

  return (
    <div className="backends-list">
      <h4>Available IBM Quantum Backends</h4>
      <div className="backends-grid">
        {backends.map((backend) => (
          <div 
            key={backend.name} 
            className={`backend-card ${backend.is_simulator ? 'simulator' : 'hardware'}`}
          >
            <div className="backend-header">
              <span className="backend-name">{backend.name}</span>
              <span className={`backend-status ${backend.status}`}>
                {backend.status}
              </span>
            </div>
            <div className="backend-info">
              <span className="backend-qubits">{backend.num_qubits} qubits</span>
              <span className="backend-type">
                {backend.is_simulator ? '🖥️ Simulator' : '💻 Hardware'}
              </span>
            </div>
            <p className="backend-description">{backend.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Export Panel
const ExportPanel = ({ circuit, onExport }) => {
  const [format, setFormat] = useState('qsharp')
  const [exportedCode, setExportedCode] = useState(null)
  const [exporting, setExporting] = useState(false)

  const handleExport = useCallback(async () => {
    if (!circuit || circuit.length === 0) return
    
    setExporting(true)
    try {
      const response = await fetch(`${API_BASE}/integration/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gates: circuit,
          num_qubits: 1,
          shots: 1000,
          format
        })
      })

      if (response.ok) {
        const data = await response.json()
        setExportedCode(data.code)
        if (onExport) onExport(data)
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExporting(false)
    }
  }, [circuit, format, onExport])

  return (
    <div className="export-panel">
      <h4>Export Circuit</h4>
      <div className="export-controls">
        <select 
          value={format} 
          onChange={(e) => setFormat(e.target.value)}
          className="format-select"
        >
          <option value="qsharp">Q# (Microsoft Quantum)</option>
          <option value="qasm">QASM</option>
          <option value="qiskit">Qiskit (Python)</option>
          <option value="braket">Amazon Braket</option>
        </select>
        <button 
          onClick={handleExport}
          disabled={exporting || !circuit || circuit.length === 0}
          className="export-button"
        >
          {exporting ? 'Exporting...' : 'Export'}
        </button>
      </div>
      
      {exportedCode && (
        <div className="exported-code">
          <pre>{exportedCode}</pre>
          <button 
            className="copy-button"
            onClick={() => navigator.clipboard.writeText(exportedCode)}
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  )
}

// Share Panel
const SharePanel = ({ circuit, onShare }) => {
  const [name, setName] = useState('My Quantum Circuit')
  const [description, setDescription] = useState('')
  const [sharing, setSharing] = useState(false)
  const [shareResult, setShareResult] = useState(null)

  const handleShare = useCallback(async () => {
    if (!circuit || circuit.length === 0) return
    
    setSharing(true)
    try {
      const response = await fetch(`${API_BASE}/integration/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gates: circuit,
          num_qubits: 1,
          shots: 1000,
          name,
          description
        })
      })

      if (response.ok) {
        const data = await response.json()
        setShareResult(data)
        if (onShare) onShare(data)
      }
    } catch (error) {
      console.error('Share error:', error)
    } finally {
      setSharing(false)
    }
  }, [circuit, name, description, onShare])

  return (
    <div className="share-panel">
      <h4>Share Circuit</h4>
      <div className="share-form">
        <div className="form-group">
          <label>Circuit Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Quantum Circuit"
          />
        </div>
        <div className="form-group">
          <label>Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this circuit does..."
          />
        </div>
        <button
          onClick={handleShare}
          disabled={sharing || !circuit || circuit.length === 0}
          className="share-button"
        >
          {sharing ? 'Sharing...' : 'Generate Share Link'}
        </button>
      </div>
      
      {shareResult && (
        <div className="share-result">
          <div className="share-link">
            <span className="link-label">Share URL:</span>
            <input
              type="text"
              readOnly
              value={shareResult.share_url}
              onClick={(e) => e.target.select()}
            />
          </div>
          <div className="share-info">
            <span>Expires: {new Date(shareResult.expires_at).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Run on IBM Panel
const RunOnIBMPanel = ({ circuit, backends }) => {
  const [selectedBackend, setSelectedBackend] = useState('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)

  const handleRun = useCallback(async () => {
    if (!circuit || circuit.length === 0 || !selectedBackend) return
    
    setRunning(true)
    setResult(null)
    try {
      const response = await fetch(`${API_BASE}/integration/run/ibm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gates: circuit,
          num_qubits: 1,
          shots: 1000,
          backend_name: selectedBackend
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      }
    } catch (error) {
      console.error('IBM run error:', error)
    } finally {
      setRunning(false)
    }
  }, [circuit, selectedBackend])

  // Auto-select first simulator if none selected
  useEffect(() => {
    if (!selectedBackend && backends.length > 0) {
      const simulator = backends.find(b => b.is_simulator && b.status === 'available')
      if (simulator) setSelectedBackend(simulator.name)
    }
  }, [backends, selectedBackend])

  return (
    <div className="run-ibm-panel">
      <h4>Run on IBM Quantum</h4>
      <div className="run-controls">
        <select
          value={selectedBackend}
          onChange={(e) => setSelectedBackend(e.target.value)}
          className="backend-select"
        >
          <option value="">Select a backend...</option>
          {backends.map((backend) => (
            <option 
              key={backend.name} 
              value={backend.name}
              disabled={backend.status !== 'available'}
            >
              {backend.name} ({backend.num_qubits} qubits) - {backend.status}
            </option>
          ))}
        </select>
        <button
          onClick={handleRun}
          disabled={running || !circuit || circuit.length === 0 || !selectedBackend}
          className="run-ibm-button"
        >
          {running ? 'Running...' : 'Run on IBM'}
        </button>
      </div>
      
      {result && (
        <div className={`ibm-result ${result.success ? 'success' : 'error'}`}>
          {result.success ? (
            <>
              <h5>Execution Complete</h5>
              <div className="result-details">
                <span>Job ID: {result.job_id}</span>
                <span>Backend: {result.backend}</span>
                {result.execution_time && (
                  <span>Time: {result.execution_time.toFixed(2)}s</span>
                )}
              </div>
              {result.result?.probabilities && (
                <div className="probabilities">
                  <h6>Probabilities:</h6>
                  <pre>{JSON.stringify(result.result.probabilities, null, 2)}</pre>
                </div>
              )}
            </>
          ) : (
            <div className="error-message">
              <strong>Error:</strong> {result.error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Main Integration Panel
const IntegrationPanel = ({ circuit = [] }) => {
  const { addAIMessage } = useAIMessage()
  const { status, loading: statusLoading } = useIntegrationStatus()
  const { backends, loading: backendsLoading } = useIBMBackends()
  const [activeTab, setActiveTab] = useState('status')

  const handleExport = useCallback((data) => {
    addAIMessage({
      type: 'system',
      content: `Circuit exported to ${data.format.toUpperCase()} format`
    })
  }, [addAIMessage])

  const handleShare = useCallback((data) => {
    addAIMessage({
      type: 'system',
      content: `Circuit shared! Share ID: ${data.share_id}`
    })
  }, [addAIMessage])

  const tabs = [
    { id: 'status', label: 'Status', icon: '📊' },
    { id: 'backends', label: 'IBM Backends', icon: '🔌' },
    { id: 'export', label: 'Export', icon: '📤' },
    { id: 'share', label: 'Share', icon: '🔗' },
    { id: 'run', label: 'Run on IBM', icon: '🚀' }
  ]

  return (
    <div className="integration-panel">
      <div className="panel-header">
        <h3>Quantum Integrations</h3>
        <p>Connect to real quantum computers and export circuits</p>
      </div>

      {/* Tab Navigation */}
      <div className="panel-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`panel-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="panel-content">
        {activeTab === 'status' && (
          <div className="tab-content">
            {statusLoading ? (
              <div className="loading">Loading integration status...</div>
            ) : (
              <StatusCard status={status} />
            )}
          </div>
        )}

        {activeTab === 'backends' && (
          <div className="tab-content">
            <BackendsList backends={backends} loading={backendsLoading} />
          </div>
        )}

        {activeTab === 'export' && (
          <div className="tab-content">
            <ExportPanel circuit={circuit} onExport={handleExport} />
          </div>
        )}

        {activeTab === 'share' && (
          <div className="tab-content">
            <SharePanel circuit={circuit} onShare={handleShare} />
          </div>
        )}

        {activeTab === 'run' && (
          <div className="tab-content">
            <RunOnIBMPanel circuit={circuit} backends={backends} />
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="panel-help">
        <p>
          <strong>Note:</strong> To run on real IBM Quantum hardware, 
          set <code>IBM_QUANTUM_API_TOKEN</code> in your .env file.
          Get a free token at <a href="https://quantum.ibm.com" target="_blank" rel="noopener">
            quantum.ibm.com
          </a>
        </p>
      </div>
    </div>
  )
}

export default IntegrationPanel