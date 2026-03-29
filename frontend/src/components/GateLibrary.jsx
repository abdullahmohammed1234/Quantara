import React, { useState, useMemo, useCallback } from 'react'
import { useAIMessage } from '../context/AIMessageContext'

/**
 * GateLibrary Component
 * Searchable library of quantum gates with detailed explanations
 * Includes gate definitions, matrices, and usage examples
 */

// Comprehensive gate database
const GATE_DATABASE = [
  // Single-qubit gates
  {
    id: 'h',
    name: 'Hadamard (H)',
    category: 'single-qubit',
    symbol: 'H',
    description: 'Creates superposition, transforming |0⟩ to (|0⟩ + |1⟩)/√2 and |1⟩ to (|0⟩ - |1⟩)/√2',
    matrix: '[[1/√2, 1/√2], [1/√2, -1/√2]]',
    eigenvalues: '1, -1',
    hermitian: true,
    unitary: true,
    geometric: 'Rotates around X+Z axis by π radians',
    usage: 'Creating superposition states, implementing quantum parallelism',
    examples: ['Create equal superposition: H|0⟩', 'Create superposition with phase: H|1⟩'],
    equivalent: 'RX(π)·RY(π/2) up to global phase'
  },
  {
    id: 'x',
    name: 'Pauli-X (X)',
    category: 'single-qubit',
    symbol: 'X',
    description: 'Quantum NOT gate - flips |0⟩ to |1⟩ and |1⟩ to |0⟩',
    matrix: '[[0, 1], [1, 0]]',
    eigenvalues: '1, -1',
    hermitian: true,
    unitary: true,
    geometric: 'π rotation around X-axis',
    usage: 'Bit flip, state inversion, implementing classical NOT',
    examples: ['X|0⟩ = |1⟩', 'X|1⟩ = |0⟩', 'X² = I'],
    equivalent: 'RX(π)'
  },
  {
    id: 'y',
    name: 'Pauli-Y (Y)',
    category: 'single-qubit',
    symbol: 'Y',
    description: 'Applies both bit flip and phase flip simultaneously',
    matrix: '[[0, -i], [i, 0]]',
    eigenvalues: '1, -1',
    hermitian: true,
    unitary: true,
    geometric: 'π rotation around Y-axis',
    usage: 'Bit and phase flip, tomography',
    examples: ['Y|0⟩ = i|1⟩', 'Y|1⟩ = -i|0⟩'],
    equivalent: 'RY(π)'
  },
  {
    id: 'z',
    name: 'Pauli-Z (Z)',
    category: 'single-qubit',
    symbol: 'Z',
    description: 'Phase flip gate - changes phase of |1⟩ while leaving |0⟩ unchanged',
    matrix: '[[1, 0], [0, -1]]',
    eigenvalues: '1, -1',
    hermitian: true,
    unitary: true,
    geometric: 'π rotation around Z-axis',
    usage: 'Phase kickback, phase estimation, creating phase differences',
    examples: ['Z|0⟩ = |0⟩', 'Z|1⟩ = -|1⟩'],
    equivalent: 'RZ(π)'
  },
  {
    id: 's',
    name: 'Phase (S)',
    category: 'single-qubit',
    symbol: 'S',
    description: 'π/2 phase gate - applies quarter phase rotation',
    matrix: '[[1, 0], [0, i]]',
    eigenvalues: '1, i',
    hermitian: false,
    unitary: true,
    geometric: 'π/2 rotation around Z-axis (T²)',
    usage: 'Creating relative phase, implementing T gates',
    examples: ['S|0⟩ = |0⟩', 'S|1⟩ = i|1⟩', 'S² = Z'],
    equivalent: 'RZ(π/2)'
  },
  {
    id: 't',
    name: 'T Gate',
    category: 'single-qubit',
    symbol: 'T',
    description: 'π/4 phase gate - fundamental gate for universal quantum computing',
    matrix: '[[1, 0], [0, e^(iπ/4)]]',
    eigenvalues: '1, e^(iπ/4)',
    hermitian: false,
    unitary: true,
    geometric: 'π/4 rotation around Z-axis',
    usage: 'Building arbitrary single-qubit rotations, fault-tolerant computing',
    examples: ['T|0⟩ = |0⟩', 'T|1⟩ = e^(iπ/4)|1⟩', 'T⁴ = Z'],
    equivalent: 'RZ(π/4)'
  },
  {
    id: 'rx',
    name: 'Rotation X (RX)',
    category: 'rotation',
    symbol: 'RX(θ)',
    description: 'Rotation by angle θ around the X-axis',
    matrix: '[[cos(θ/2), -i·sin(θ/2)], [-i·sin(θ/2), cos(θ/2)]]',
    eigenvalues: 'e^(±iθ/2)',
    hermitian: false,
    unitary: true,
    geometric: 'θ rotation around X-axis',
    usage: 'Arbitrary rotations, state preparation',
    examples: ['RX(π) = X', 'RX(π/2) creates Y eigenstates'],
    params: { theta: { min: 0, max: '2π', default: 'π/2' } }
  },
  {
    id: 'ry',
    name: 'Rotation Y (RY)',
    category: 'rotation',
    symbol: 'RY(θ)',
    description: 'Rotation by angle θ around the Y-axis',
    matrix: '[[cos(θ/2), -sin(θ/2)], [sin(θ/2), cos(θ/2)]]',
    eigenvalues: 'e^(±iθ/2)',
    hermitian: false,
    unitary: true,
    geometric: 'θ rotation around Y-axis',
    usage: 'Arbitrary rotations, moving between |0⟩ and |1⟩',
    examples: ['RY(π) = Y', 'RY(π/2)|0⟩ = (|0⟩ + |1⟩)/√2'],
    params: { theta: { min: 0, max: '2π', default: 'π/2' } }
  },
  {
    id: 'rz',
    name: 'Rotation Z (RZ)',
    category: 'rotation',
    symbol: 'RZ(θ)',
    description: 'Rotation by angle θ around the Z-axis (phase rotation)',
    matrix: '[[e^(-iθ/2), 0], [0, e^(iθ/2)]]',
    eigenvalues: 'e^(±iθ/2)',
    hermitian: false,
    unitary: true,
    geometric: 'θ rotation around Z-axis',
    usage: 'Phase adjustments, arbitrary single-qubit operations',
    examples: ['RZ(π) = Z', 'RZ(π/2) = S'],
    params: { theta: { min: 0, max: '2π', default: 'π/2' } }
  },
  // Two-qubit gates
  {
    id: 'cx',
    name: 'Controlled-X (CNOT)',
    category: 'two-qubit',
    symbol: 'CX',
    description: 'Flip target qubit if control qubit is |1⟩',
    matrix: '[[1,0,0,0], [0,1,0,0], [0,0,0,1], [0,0,1,0]]',
    eigenvalues: '1 (3×), -1',
    hermitian: true,
    unitary: true,
    geometric: 'Controlled π rotation around X',
    usage: 'Entanglement, Bell states, quantum copying',
    examples: ['CX|00⟩ = |00⟩', 'CX|01⟩ = |01⟩', 'CX|10⟩ = |11⟩', 'CX|11⟩ = |10⟩'],
    equivalent: 'Controlled-X'
  },
  {
    id: 'cz',
    name: 'Controlled-Z (CZ)',
    category: 'two-qubit',
    symbol: 'CZ',
    description: 'Apply Z to target if control is |1⟩ - symmetric gate',
    matrix: '[[1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0,-1]]',
    eigenvalues: '1 (3×), -1',
    hermitian: true,
    unitary: true,
    geometric: 'Controlled π rotation around Z',
    usage: 'Entanglement, phase kickback, GHZ states',
    examples: ['CZ|++⟩ = |--⟩', 'CZ|00⟩ = |00⟩', 'CZ|11⟩ = -|11⟩'],
    equivalent: 'CX in different basis'
  },
  {
    id: 'swap',
    name: 'SWAP',
    category: 'two-qubit',
    symbol: 'SWAP',
    description: 'Exchange the states of two qubits',
    matrix: '[[1,0,0,0], [0,0,1,0], [0,1,0,0], [0,0,0,1]]',
    eigenvalues: '1 (2×), -1',
    hermitian: true,
    unitary: true,
    geometric: 'π rotation in swap subspace',
    usage: 'Qubit routing, teleportation',
    examples: ['SWAP|01⟩ = |10⟩', 'SWAP|00⟩ = |00⟩'],
    equivalent: 'CX·(I⊗H)·CX·(I⊗H)'
  },
  {
    id: 'cp',
    name: 'Controlled-Phase (CP)',
    category: 'two-qubit',
    symbol: 'CP(θ)',
    description: 'Apply phase θ to target if both qubits are |1⟩',
    matrix: '[[1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0, e^(iθ)]]',
    eigenvalues: '1 (3×), e^(iθ)',
    hermitian: false,
    unitary: true,
    geometric: 'Controlled θ rotation around Z',
    usage: 'Phase estimation, controlled rotations',
    examples: ['CP(π) = CZ', 'CP(π/2) adds phase to |11⟩'],
    params: { theta: { min: 0, max: '2π', default: 'π/2' } }
  },
  // Three-qubit gates
  {
    id: 'ccx',
    name: 'Toffoli (CCX)',
    category: 'three-qubit',
    symbol: 'CCX',
    description: 'Flip target if both controls are |1⟩ - universal classical gate',
    matrix: '8×8 identity with bottom-right 2×2 swapped',
    eigenvalues: '1 (7×), -1',
    hermitian: true,
    unitary: true,
    geometric: 'Double-controlled π rotation around X',
    usage: 'Classical logic, arithmetic, fault-tolerant computing',
    examples: ['CCX|110⟩ = |111⟩', 'CCX|100⟩ = |100⟩'],
    equivalent: 'Controlled-Controlled-X'
  },
  {
    id: 'cswap',
    name: 'Fredkin (CSWAP)',
    category: 'three-qubit',
    symbol: 'CSWAP',
    description: 'Swap target qubits if control is |1⟩',
    matrix: '8×8 with SWAP in specific subspaces',
    eigenvalues: '1 (6×), -1, 1',
    hermitian: true,
    unitary: true,
    geometric: 'Controlled SWAP',
    usage: 'Reversible computing, quantum networks',
    examples: ['CSWAP|101⟩ = |011⟩', 'CSWAP|100⟩ = |100⟩'],
    equivalent: 'Controlled-SWAP'
  },
  // Specialized gates
  {
    id: 'sqrt-x',
    name: 'Square Root X (√X)',
    category: 'single-qubit',
    symbol: '√X',
    description: 'Square root of Pauli-X - half the rotation',
    matrix: '[[(1+i)/2, (1-i)/2], [(1-i)/2, (1+i)/2]]',
    eigenvalues: 'e^(±iπ/4)',
    hermitian: false,
    unitary: true,
    geometric: 'π/4 rotation around X (half of X)',
    usage: 'Creating cat states, anyon braiding',
    examples: ['(√X)² = X', '√X|0⟩ = (|0⟩ + i|1⟩)/√2'],
    equivalent: 'RX(π/2)'
  },
  {
    id: 'u1',
    name: 'U1 (Phase)',
    category: 'rotation',
    symbol: 'U1(λ)',
    description: 'Single-qubit phase rotation (used in IBM Qiskit)',
    matrix: '[[1, 0], [0, e^(iλ)]]',
    eigenvalues: '1, e^(iλ)',
    hermitian: false,
    unitary: true,
    geometric: 'λ rotation around Z',
    usage: 'Phase gates in arbitrary-basis gates',
    examples: ['U1(π) = Z', 'U1(π/2) = S'],
    params: { lambda: { min: 0, max: '2π', default: 'π/4' } }
  },
  {
    id: 'u2',
    name: 'U2',
    category: 'rotation',
    symbol: 'U2(φ,λ)',
    description: 'Single-qubit gate with 2 parameters - creates any pure state',
    matrix: '[[1, -e^(iλ)], [e^(iφ), e^(i(φ+λ))]]/√2',
    eigenvalues: 'complex',
    hermitian: false,
    unitary: true,
    geometric: 'Affects both phase and superposition',
    usage: 'Arbitrary single-qubit state preparation',
    examples: ['U2(0,0) = H', 'U2(0,π) = Y'],
    params: { phi: { min: 0, max: '2π' }, lambda: { min: 0, max: '2π' } }
  },
  {
    id: 'u3',
    name: 'U3',
    category: 'rotation',
    symbol: 'U3(θ,φ,λ)',
    description: 'Most general single-qubit gate - 3 parameters',
    matrix: '[[cos(θ/2), -e^(iλ)sin(θ/2)], [e^(iφ)sin(θ/2), e^(i(φ+λ))cos(θ/2)]]',
    eigenvalues: 'complex',
    hermitian: false,
    unitary: true,
    geometric: 'Any single-qubit unitary',
    usage: 'Universal single-qubit operations',
    examples: ['U3(θ,0,0) = RY(θ)', 'U3(π/2,0,0) = H'],
    params: { theta: { min: 0, max: 'π' }, phi: { min: 0, max: '2π' }, lambda: { min: 0, max: '2π' } }
  },
  {
    id: 'measure',
    name: 'Measurement (M)',
    category: 'measurement',
    symbol: 'M',
    description: 'Measure qubit in computational basis - collapses quantum state',
    matrix: 'Non-unitary (projection)',
    eigenvalues: '0, 1',
    hermitian: true,
    unitary: false,
    geometric: 'Projection onto |0⟩ or |1⟩',
    usage: 'Reading out quantum state, feedback',
    examples: ['M|0⟩ → |0⟩ (prob 1)', 'M|+⟩ → |0⟩ or |1⟩ (each 50%)'],
    nonHermitian: true
  }
]

// Categories for filtering
const CATEGORIES = [
  { id: 'all', name: 'All Gates', icon: '⚛️' },
  { id: 'single-qubit', name: 'Single-Qubit', icon: '1️⃣' },
  { id: 'rotation', name: 'Rotations', icon: '🔄' },
  { id: 'two-qubit', name: 'Two-Qubit', icon: '2️⃣' },
  { id: 'three-qubit', name: 'Three-Qubit', icon: '3️⃣' },
  { id: 'measurement', name: 'Measurement', icon: '📊' }
]

/**
 * GateCard - Individual gate display component
 */
const GateCard = ({ gate, isExpanded, onToggle }) => {
  return (
    <div className={`gate-card ${gate.category} ${isExpanded ? 'expanded' : ''}`}>
      <div className="gate-card-header" onClick={onToggle}>
        <div className="gate-symbol">{gate.symbol}</div>
        <div className="gate-info">
          <h4>{gate.name}</h4>
          <p>{gate.description.substring(0, 60)}...</p>
        </div>
        <div className="gate-expand-icon">{isExpanded ? '▲' : '▼'}</div>
      </div>
      
      {isExpanded && (
        <div className="gate-card-details">
          <div className="detail-section">
            <h5>Matrix Representation</h5>
            <div className="matrix-display">
              <code>{gate.matrix}</code>
            </div>
          </div>
          
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Category</span>
              <span className="detail-value">{gate.category}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Unitary</span>
              <span className={`detail-value ${gate.unitary ? 'yes' : 'no'}`}>
                {gate.unitary ? '✓' : '✗'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Hermitian</span>
              <span className={`detail-value ${gate.hermitian ? 'yes' : 'no'}`}>
                {gate.hermitian ? '✓' : '✗'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Eigenvalues</span>
              <span className="detail-value">{gate.eigenvalues}</span>
            </div>
          </div>
          
          {gate.geometric && (
            <div className="detail-section">
              <h5>Geometric Interpretation</h5>
              <p>{gate.geometric}</p>
            </div>
          )}
          
          {gate.usage && (
            <div className="detail-section">
              <h5>Usage</h5>
              <p>{gate.usage}</p>
            </div>
          )}
          
          {gate.examples && (
            <div className="detail-section">
              <h5>Examples</h5>
              <ul>
                {gate.examples.map((ex, i) => (
                  <li key={i}><code>{ex}</code></li>
                ))}
              </ul>
            </div>
          )}
          
          {gate.equivalent && (
            <div className="detail-section">
              <h5>Equivalent Operations</h5>
              <p><code>{gate.equivalent}</code></p>
            </div>
          )}
          
          {gate.params && (
            <div className="detail-section">
              <h5>Parameters</h5>
              <div className="params-list">
                {Object.entries(gate.params).map(([key, val]) => (
                  <div key={key} className="param-item">
                    <span className="param-name">{key}:</span>
                    <span className="param-range">range [{val.min}, {val.max}], default: {val.default}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * GateLibrary - Main component
 */
const GateLibrary = () => {
  const { addAIMessage } = useAIMessage()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedGate, setExpandedGate] = useState(null)

  const filteredGates = useMemo(() => {
    return GATE_DATABASE.filter(gate => {
      const matchesSearch = gate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gate.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gate.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gate.category.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || gate.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value)
    addAIMessage({
      type: 'system',
      content: `Searching gates: "${e.target.value}"`
    })
  }, [addAIMessage])

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category)
    setExpandedGate(null)
    addAIMessage({
      type: 'system',
      content: `Filtering by category: ${category}`
    })
  }, [addAIMessage])

  const handleGateClick = useCallback((gateId) => {
    setExpandedGate(expandedGate === gateId ? null : gateId)
  }, [expandedGate])

  const gateCounts = useMemo(() => {
    const counts = { 'all': GATE_DATABASE.length }
    CATEGORIES.slice(1).forEach(cat => {
      counts[cat.id] = GATE_DATABASE.filter(g => g.category === cat.id).length
    })
    return counts
  }, [])

  return (
    <div className="gate-library">
      <div className="library-header">
        <h2>Quantum Gate Library</h2>
        <p>Comprehensive reference of quantum gates with detailed explanations</p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search gates by name, symbol, or description..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        <div className="search-icon">🔍</div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {CATEGORIES.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category.id)}
          >
            <span className="cat-icon">{category.icon}</span>
            <span className="cat-name">{category.name}</span>
            <span className="cat-count">({gateCounts[category.id] || 0})</span>
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="results-info">
        Showing {filteredGates.length} of {GATE_DATABASE.length} gates
      </div>

      {/* Gate Grid */}
      <div className="gate-grid">
        {filteredGates.map(gate => (
          <GateCard
            key={gate.id}
            gate={gate}
            isExpanded={expandedGate === gate.id}
            onToggle={() => handleGateClick(gate.id)}
          />
        ))}
      </div>

      {filteredGates.length === 0 && (
        <div className="no-results">
          <p>No gates found matching your search.</p>
          <button onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}

export default GateLibrary