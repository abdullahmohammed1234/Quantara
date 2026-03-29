import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * GlobalSearchModal - Cmd/Ctrl+K global search across the application
 * Searches: Gates, Algorithms, Challenges, Chat History
 */

// Gate database from GateLibrary component
const GATE_DATABASE = [
  { id: 'h', name: 'Hadamard (H)', category: 'single-qubit', description: 'Creates superposition' },
  { id: 'x', name: 'Pauli-X (X)', category: 'single-qubit', description: 'Quantum NOT gate' },
  { id: 'y', name: 'Pauli-Y (Y)', category: 'single-qubit', description: 'Bit and phase flip' },
  { id: 'z', name: 'Pauli-Z (Z)', category: 'single-qubit', description: 'Phase flip gate' },
  { id: 's', name: 'Phase (S)', category: 'single-qubit', description: 'π/2 phase gate' },
  { id: 't', name: 'T Gate', category: 'single-qubit', description: 'π/4 phase gate' },
  { id: 'cx', name: 'CNOT', category: 'multi-qubit', description: 'Controlled NOT gate' },
  { id: 'cz', name: 'CZ', category: 'multi-qubit', description: 'Controlled Phase gate' },
  { id: 'swap', name: 'SWAP', category: 'multi-qubit', description: 'Qubit swap gate' },
  { id: 'toffoli', name: 'Toffoli (CCNOT)', category: 'multi-qubit', description: 'Double-controlled NOT' },
]

// Algorithm database
const ALGORITHM_DATABASE = [
  { id: 'shor', name: "Shor's Algorithm", description: 'Integer factorization algorithm' },
  { id: 'grover', name: "Grover's Algorithm", description: 'Search algorithm for unstructured data' },
  { id: 'qft', name: 'Quantum Fourier Transform', description: 'Quantum version of discrete Fourier transform' },
  { id: 'vqe', name: 'VQE', description: 'Variational Quantum Eigensolver' },
  { id: 'qaoa', name: 'QAOA', description: 'Quantum Approximate Optimization Algorithm' },
  { id: 'deutsch-jozsa', name: 'Deutsch-Jozsa', description: 'Query-efficient oracle-based algorithm' },
  { id: 'bernstein', name: 'Bernstein-Vazirani', description: 'Quantum query algorithm' },
  { id: 'simon', name: "Simon's Algorithm", description: 'Period-finding quantum algorithm' },
]

// Challenge database
const CHALLENGE_DATABASE = [
  { id: 'superposition', name: 'Superposition Challenge', description: 'Create superposition states' },
  { id: 'entanglement', name: 'Entanglement Challenge', description: 'Create Bell states' },
  { id: 'teleportation', name: 'Quantum Teleportation', description: 'Teleport a qubit state' },
  { id: 'error-correction', name: 'Error Correction', description: 'Protect against quantum errors' },
  { id: 'grover-search', name: 'Grover Search Challenge', description: 'Implement Grover algorithm' },
]

// Category icons
const CATEGORY_ICONS = {
  gates: '⚡',
  algorithms: '🧠',
  challenges: '🎯',
  chat: '💬',
}

// Search result categories
const SEARCH_CATEGORIES = {
  gates: { icon: '⚡', label: 'Gates' },
  algorithms: { icon: '🧠', label: 'Algorithms' },
  challenges: { icon: '🎯', label: 'Challenges' },
  chat: { icon: '💬', label: 'Chat History' },
}

export const GlobalSearchModal = ({ isOpen, onClose, onSelectChat }) => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeCategory, setActiveCategory] = useState('all')
  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Search across all categories
  const search = useCallback((searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const q = searchQuery.toLowerCase()
    const searchResults = []

    // Search gates
    if (activeCategory === 'all' || activeCategory === 'gates') {
      GATE_DATABASE.forEach(gate => {
        if (gate.name.toLowerCase().includes(q) || gate.description.toLowerCase().includes(q)) {
          searchResults.push({ type: 'gates', ...gate })
        }
      })
    }

    // Search algorithms
    if (activeCategory === 'all' || activeCategory === 'algorithms') {
      ALGORITHM_DATABASE.forEach(algo => {
        if (algo.name.toLowerCase().includes(q) || algo.description.toLowerCase().includes(q)) {
          searchResults.push({ type: 'algorithms', ...algo })
        }
      })
    }

    // Search challenges
    if (activeCategory === 'all' || activeCategory === 'challenges') {
      CHALLENGE_DATABASE.forEach(challenge => {
        if (challenge.name.toLowerCase().includes(q) || challenge.description.toLowerCase().includes(q)) {
          searchResults.push({ type: 'challenges', ...challenge })
        }
      })
    }

    // Search chat history
    if (activeCategory === 'all' || activeCategory === 'chat') {
      try {
        const conversations = JSON.parse(localStorage.getItem('quantara_conversations') || '[]')
        conversations.forEach(conv => {
          const title = conv.title?.toLowerCase() || ''
          const messages = conv.messages || []
          const messageContent = messages.map(m => m.content || '').join(' ').toLowerCase()
          
          if (title.includes(q) || messageContent.includes(q)) {
            searchResults.push({
              type: 'chat',
              id: conv.id,
              name: conv.title || 'Chat',
              description: `${messages.length} messages`,
              conversationId: conv.id,
            })
          }
        })
      } catch (e) {
        // Ignore localStorage errors
      }
    }

    setResults(searchResults)
    setSelectedIndex(0)
  }, [activeCategory])

  // Handle query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      search(query)
    }, 100)
    return () => clearTimeout(timer)
  }, [query, search])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      handleSelectResult(results[selectedIndex])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [results, selectedIndex, onClose])

  // Handle result selection
  const handleSelectResult = (result) => {
    switch (result.type) {
      case 'gates':
        navigate('/gate-library')
        break
      case 'algorithms':
        navigate('/algorithms')
        break
      case 'challenges':
        navigate('/challenges')
        break
      case 'chat':
        if (onSelectChat) {
          onSelectChat(result.conversationId)
        }
        break
      default:
        break
    }
    onClose()
  }

  // Scroll selected result into view
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex]
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex, results])

  if (!isOpen) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        zIndex: 9999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          background: '#1a1a2e',
          borderRadius: '12px',
          border: '1px solid #00d4ff',
          boxShadow: '0 0 40px rgba(0, 212, 255, 0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Search Input */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #2a2a3e',
        }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search gates, algorithms, challenges..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '18px',
              color: '#fff',
              caretColor: '#00d4ff',
            }}
          />
        </div>

        {/* Category Filters */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 16px',
          borderBottom: '1px solid #2a2a3e',
          flexWrap: 'wrap',
        }}>
          {Object.entries(SEARCH_CATEGORIES).map(([key, { icon, label }]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key === activeCategory ? 'all' : key)}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                border: activeCategory === key ? '1px solid #00d4ff' : '1px solid #3a3a4a',
                background: activeCategory === key ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                color: activeCategory === key ? '#00d4ff' : '#8a8a9a',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Search Results */}
        <div 
          ref={resultsRef}
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {results.length === 0 && query && (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: '#6a6a7a',
            }}>
              No results found for "{query}"
            </div>
          )}

          {results.length === 0 && !query && (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: '#6a6a7a',
            }}>
              Start typing to search...
            </div>
          )}

          {results.map((result, index) => {
            const category = SEARCH_CATEGORIES[result.type]
            const isSelected = index === selectedIndex

            return (
              <div
                key={`${result.type}-${result.id}`}
                onClick={() => handleSelectResult(result)}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                  border: isSelected ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid transparent',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '18px' }}>{category?.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 500 }}>{result.name}</div>
                  <div style={{ color: '#6a6a7a', fontSize: '13px' }}>{result.description}</div>
                </div>
                <span style={{
                  color: '#4a4a5a',
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: '#2a2a3e',
                }}>
                  {category?.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Footer hints */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #2a2a3e',
          display: 'flex',
          justifyContent: 'space-between',
          color: '#4a4a5a',
          fontSize: '12px',
        }}>
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  )
}

export default GlobalSearchModal