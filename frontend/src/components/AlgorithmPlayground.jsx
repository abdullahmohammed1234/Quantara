import React, { useState, useCallback, useMemo } from 'react'
import { useAIMessage } from '../context/AIMessageContext'

/**
 * AlgorithmPlayground Component
 * Interactive drag-and-drop playground for quantum algorithms (Grover's, Shor's)
 * Allows users to explore and understand quantum algorithms visually
 */

const GROVER_N = 3 // Number of bits for Grover's algorithm demo

// Grover's algorithm oracle patterns
const ORACLE_PATTERNS = [
  { pattern: '101', label: 'Search for |101⟩' },
  { pattern: '011', label: 'Search for |011⟩' },
  { pattern: '111', label: 'Search for |111⟩' },
  { pattern: '000', label: 'Search for |000⟩' },
]

// Shor's algorithm parameters
const SHOR_PARAMS = [
  { a: 4, N: 15, label: 'a=4, N=15 (15 = 3 × 5)' },
  { a: 2, N: 21, label: 'a=2, N=21 (21 = 3 × 7)' },
  { a: 3, N: 35, label: 'a=3, N=35 (35 = 5 × 7)' },
  { a: 2, N: 33, label: 'a=2, N=33 (33 = 3 × 11)' },
]

/**
 * GroverVisualization - Visual representation of Grover's search algorithm
 */
const GroverVisualization = ({ selectedPattern, iterations, onIterationsChange }) => {
  const probabilityData = useMemo(() => {
    // Simulate Grover's algorithm probability evolution
    const totalStates = Math.pow(2, GROVER_N)
    const targetState = parseInt(selectedPattern, 2)
    const angle = Math.asin(1 / Math.sqrt(totalStates))
    
    // Calculate probability for each iteration
    const data = []
    for (let i = 0; i <= iterations; i++) {
      const prob = Math.sin((2 * i + 1) * angle) ** 2
      data.push({
        iteration: i,
        targetProbability: prob,
        otherProbability: (1 - prob) / (totalStates - 1)
      })
    }
    return data
  }, [selectedPattern, iterations])

  const currentProb = probabilityData[probabilityData.length - 1]

  return (
    <div className="grover-visualization">
      <div className="viz-header">
        <h3>Grover's Search Algorithm</h3>
        <p>Searching for: <span className="highlight">{selectedPattern}</span></p>
      </div>

      <div className="grover-circuit">
        <div className="circuit-label">Oracle</div>
        <div className="circuit-line">
          {[...Array(GROVER_N)].map((_, i) => (
            <div key={i} className="gate-block oracle" title="Oracle - marks target state">
              f
            </div>
          ))}
        </div>
        <div className="circuit-label">Diffusion</div>
        <div className="circuit-line">
          {[...Array(GROVER_N)].map((_, i) => (
            <div key={i} className="gate-block diffusion" title="Diffusion operator">
              D
            </div>
          ))}
        </div>
      </div>

      <div className="iteration-control">
        <label>Iterations: {iterations}</label>
        <input 
          type="range" 
          min="0" 
          max="2" 
          value={iterations}
          onChange={(e) => onIterationsChange(parseInt(e.target.value))}
        />
        <div className="iteration-markers">
          {[0, 1, 2].map(i => (
            <span 
              key={i} 
              className={iterations === i ? 'active' : ''}
              onClick={() => onIterationsChange(i)}
            >
              {i}
            </span>
          ))}
        </div>
        <p className="optimal-note">
          Optimal: ~{(Math.PI / (4 * Math.asin(1 / Math.sqrt(Math.pow(2, GROVER_N))))) - 1}.{'\n'}iterations for {Math.pow(2, GROVER_N)} states
        </p>
      </div>

      <div className="probability-display">
        <div className="prob-bar">
          <div className="prob-label">Target State |{selectedPattern}⟩</div>
          <div className="bar-container">
            <div 
              className="bar-fill target" 
              style={{ width: `${currentProb.targetProbability * 100}%` }}
            />
          </div>
          <div className="prob-value">{(currentProb.targetProbability * 100).toFixed(1)}%</div>
        </div>
        <div className="prob-bar">
          <div className="prob-label">Other States</div>
          <div className="bar-container">
            <div 
              className="bar-fill other" 
              style={{ width: `${currentProb.otherProbability * 100 * (Math.pow(2, GROVER_N) - 1)}%` }}
            />
          </div>
          <div className="prob-value">{(currentProb.otherProbability * 100 * (Math.pow(2, GROVER_N) - 1)).toFixed(1)}%</div>
        </div>
      </div>

      <div className="grover-explanation">
        <h4>How it works:</h4>
        <ol>
          <li><strong>Initialization:</strong> Start with all qubits in |0⟩, apply H to create superposition</li>
          <li><strong>Oracle:</strong> Mark the target state with a phase shift</li>
          <li><strong>Diffusion:</strong> Reflect about the mean amplitude</li>
          <li><strong>Repeat:</strong> After O(√N) iterations, measurement yields target with high probability</li>
        </ol>
      </div>
    </div>
  )
}

/**
 * ShorVisualization - Visual representation of Shor's factoring algorithm
 */
const ShorVisualization = ({ params, periodResult, onSimulate }) => {
  const [simulating, setSimulating] = useState(false)
  const [result, setResult] = useState(null)

  const handleSimulate = async () => {
    setSimulating(true)
    // Simulate Shor's algorithm period finding
    setTimeout(() => {
      // Simple simulation of period finding
      const { a, N } = params
      let period = 1
      let x = a % N
      while (x !== 1) {
        x = (x * a) % N
        period++
        if (period > 20) break // limit for demo
      }
      setResult({ period, factors: findFactors(period, N) })
      setSimulating(false)
    }, 1500)
  }

  const findFactors = (r, N) => {
    if (r % 2 === 1) return null
    const candidate = Math.pow(a, r / 2) % N
    if (candidate === 1 || candidate === N - 1) return null
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b)
    const f1 = gcd(candidate + 1, N)
    const f2 = gcd(candidate - 1, N)
    return f1 > 1 && f1 < N ? [f1, N / f1] : f2 > 1 && f2 < N ? [f2, N / f2] : null
  }

  // Extract a from params for gcd function
  const a = params.a

  return (
    <div className="shor-visualization">
      <div className="viz-header">
        <h3>Shor's Factoring Algorithm</h3>
        <p>Factoring: <span className="highlight">N = {params.N}</span></p>
      </div>

      <div className="shor-circuit">
        <div className="circuit-section">
          <div className="section-label">Quantum Period Finding</div>
          <div className="circuit-row">
            <div className="gate-block hadamard" title="Create superposition">H⊗n</div>
          </div>
          <div className="circuit-row">
            <div className="gate-block modular" title="Modular exponentiation">a^x mod N</div>
          </div>
          <div className="circuit-row">
            <div className="gate-block qft" title="Quantum Fourier Transform">QFT</div>
          </div>
        </div>
      </div>

      <div className="shor-params">
        <div className="param-display">
          <span>Base (a): <strong>{params.a}</strong></span>
          <span>Modulus (N): <strong>{params.N}</strong></span>
        </div>
        <button 
          className="simulate-btn"
          onClick={handleSimulate}
          disabled={simulating}
        >
          {simulating ? 'Finding Period...' : 'Find Period'}
        </button>
      </div>

      {result && (
        <div className="shor-result">
          <div className="result-item">
            <span className="result-label">Period (r):</span>
            <span className="result-value">{result.period}</span>
          </div>
          {result.factors ? (
            <div className="result-item factors">
              <span className="result-label">Factors:</span>
              <span className="result-value">
                {params.N} = {result.factors.join(' × ')}
              </span>
            </div>
          ) : (
            <div className="result-item">
              <span className="result-note">Period finding incomplete - try again</span>
            </div>
          )}
        </div>
      )}

      <div className="shor-explanation">
        <h4>How it works:</h4>
        <ol>
          <li><strong>Choose random a:</strong> Pick a random number coprime to N</li>
          <li><strong>Period finding:</strong> Use quantum computer to find period of f(x) = a^x mod N</li>
          <li><strong>Classical processing:</strong> Use period to derive factors using number theory</li>
          <li><strong>Exponential speedup:</strong> This would take classical computers exponential time!</li>
        </ol>
        <p className="shor-note">
          Note: This demo shows a simplified version. Real Shor's algorithm requires 
          a quantum computer with many more qubits.
        </p>
      </div>
    </div>
  )
}

/**
 * AlgorithmPlayground - Main component
 */
const AlgorithmPlayground = () => {
  const { addAIMessage } = useAIMessage()
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('grover')
  const [groverPattern, setGroverPattern] = useState('101')
  const [groverIterations, setGroverIterations] = useState(0)
  const [shorParams, setShorParams] = useState(SHOR_PARAMS[0])

  const handleAlgorithmChange = useCallback((algo) => {
    setSelectedAlgorithm(algo)
    addAIMessage({
      type: 'system',
      content: `Switched to ${algo === 'grover' ? "Grover's Search" : "Shor's Factoring"} algorithm playground`
    })
  }, [addAIMessage])

  const handlePatternChange = useCallback((pattern) => {
    setGroverPattern(pattern)
    setGroverIterations(0)
  }, [])

  return (
    <div className="algorithm-playground">
      <div className="playground-header">
        <h2>Interactive Algorithm Playground</h2>
        <p>Explore quantum algorithms through interactive visualizations</p>
      </div>

      {/* Algorithm Selection */}
      <div className="algorithm-tabs">
        <button 
          className={`tab ${selectedAlgorithm === 'grover' ? 'active' : ''}`}
          onClick={() => handleAlgorithmChange('grover')}
        >
          <span className="tab-icon">🔍</span>
          Grover's Search
        </button>
        <button 
          className={`tab ${selectedAlgorithm === 'shor' ? 'active' : ''}`}
          onClick={() => handleAlgorithmChange('shor')}
        >
          <span className="tab-icon">🔢</span>
          Shor's Factoring
        </button>
      </div>

      {/* Algorithm-specific controls */}
      {selectedAlgorithm === 'grover' && (
        <div className="grover-controls">
          <div className="pattern-selector">
            <label>Select search target:</label>
            <div className="pattern-buttons">
              {ORACLE_PATTERNS.map(({ pattern, label }) => (
                <button
                  key={pattern}
                  className={`pattern-btn ${groverPattern === pattern ? 'selected' : ''}`}
                  onClick={() => handlePatternChange(pattern)}
                >
                  |{pattern}⟩ 
                  <span className="pattern-label">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedAlgorithm === 'shor' && (
        <div className="shor-controls">
          <div className="params-selector">
            <label>Select parameters:</label>
            <div className="params-buttons">
              {SHOR_PARAMS.map((p, i) => (
                <button
                  key={i}
                  className={`params-btn ${shorParams.a === p.a && shorParams.N === p.N ? 'selected' : ''}`}
                  onClick={() => setShorParams(p)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visualization */}
      <div className="algorithm-visualization">
        {selectedAlgorithm === 'grover' ? (
          <GroverVisualization 
            selectedPattern={groverPattern}
            iterations={groverIterations}
            onIterationsChange={setGroverIterations}
          />
        ) : (
          <ShorVisualization 
            params={shorParams}
          />
        )}
      </div>

      {/* Algorithm Info Cards */}
      <div className="algorithm-cards">
        <div className="info-card grover-card">
          <h4>Grover's Algorithm</h4>
          <ul>
            <li><strong>Type:</strong> Search algorithm</li>
            <li><strong>Speedup:</strong> O(√N) vs O(N)</li>
            <li><strong>Use cases:</strong> Database search, optimization</li>
          </ul>
        </div>
        <div className="info-card shor-card">
          <h4>Shor's Algorithm</h4>
          <ul>
            <li><strong>Type:</strong> Factoring algorithm</li>
            <li><strong>Speedup:</strong> Polynomial vs exponential</li>
            <li><strong>Impact:</strong> Breaks RSA encryption</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AlgorithmPlayground