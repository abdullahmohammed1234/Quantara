import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAIMessage } from '../context/AIMessageContext'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { motion } from 'framer-motion'

// Simulated AI responses for fallback
const SIMULATED_RESPONSES = [
  "A qubit (quantum bit) is the basic unit of quantum information. Unlike classical bits that are either 0 or 1, qubits can exist in a superposition of both states.",
  "The Bloch sphere is a geometrical representation of the pure state space of a two-level quantum mechanical system. The north pole represents |0⟩, the south pole represents |1⟩.",
  "Superposition is a fundamental principle of quantum mechanics that allows a quantum system to be in multiple states at once until it's measured.",
  "Quantum entanglement is a phenomenon where particles become correlated in such a way that the quantum state of each particle cannot be described independently.",
  "Quantum gates manipulate qubits through unitary operations. Common gates include Hadamard (H), Pauli-X, Pauli-Y, Pauli-Z, and CNOT.",
]

// Context hints based on current page/route
const CONTEXT_HINTS = {
  '/': [
    "What is quantum computing?",
    "How does Quantara help learn quantum computing?",
    "What are the main features of this platform?"
  ],
  '/qubits': [
    "Explain qubit superposition",
    "What is the Bloch sphere?",
    "How do I visualize qubit states?"
  ],
  '/circuits': [
    "How do quantum circuits work?",
    "What is a quantum gate?",
    "How to build a simple quantum circuit?"
  ],
  '/algorithms': [
    "Explain Shor's algorithm",
    "What is Grover's search algorithm?",
    "How do quantum algorithms differ from classical?"
  ],
  '/gate-library': [
    "What does the Hadamard gate do?",
    "Explain Pauli-X gate",
    "What is a CNOT gate?"
  ],
  '/error-playground': [
    "What is quantum noise?",
    "How does decoherence affect qubits?",
    "What is quantum error correction?"
  ],
  '/progress': [
    "How is my progress tracked?",
    "What quantum concepts have I learned?",
    "How to improve my understanding?"
  ]
}

// Code generation templates
const CODE_TEMPLATES = {
  python_qiskit: (gates) => `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Create a ${gates.length}-qubit circuit
qc = QuantumCircuit(${Math.max(1, gates.length)}, ${Math.max(1, gates.length)})

${gates.map((gate, i) => {
  if (gate === 'H') return `qc.h(${i % Math.max(1, gates.length)})  # Hadamard gate`
  if (gate === 'X') return `qc.x(${i % Math.max(1, gates.length)})  # Pauli-X (NOT)`
  if (gate === 'Z') return `qc.z(${i % Math.max(1, gates.length)})  # Pauli-Z`
  if (gate === 'Y') return `qc.y(${i % Math.max(1, gates.length)})  # Pauli-Y`
  if (gate === 'S') return `qc.s(${i % Math.max(1, gates.length)})  # Phase gate`
  if (gate === 'T') return `qc.t(${i % Math.max(1, gates.length)})  # T gate`
  if (gate === 'CX' || gate === 'CNOT') return `qc.cx(${i % Math.max(1, gates.length)}, ${(i + 1) % Math.max(1, gates.length)})  # CNOT`
  return `qc.${gate.toLowerCase()}(${i % Math.max(1, gates.length)})`
}).join('\n')}

# Measure all qubits
qc.measure_all()

# Run simulation
simulator = AerSimulator()
result = simulator.run(qc, shots=1000).result()
counts = result.get_counts(qc)
print(f"Results: {counts}")`,

  qsharp: (gates) => `namespace QuantumExamples {
    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Circuit;
    
    operation SimpleCircuit() : Result {
        using (qubit = Qubit()) {
            ${gates.map((gate, i) => {
              if (gate === 'H') return `H(qubit);  // Hadamard`
              if (gate === 'X') return `X(qubit);  // Pauli-X`
              if (gate === 'Z') return `Z(qubit);  // Pauli-Z`
              if (gate === 'Y') return `Y(qubit);  // Pauli-Y`
              return `// ${gate} gate`
            }).join('\n            ')}
            
            return M(qubit);  // Measure
        }
    }
}`
}

// Custom renderer for code blocks with copy functionality
const CodeRenderer = ({ className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : ''
  const [copied, setCopied] = useState(false)
  
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [children])
  
  if (!match) {
    return (
      <code className={className} {...props} style={{
        background: '#1a1a2e',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '0.9em'
      }}>
        {children}
      </code>
    )
  }
  
  return (
    <div style={{ position: 'relative', margin: '1em 0' }}>
      {/* Language badge and copy button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        background: '#1a1a2e',
        borderRadius: '8px 8px 0 0',
        border: '1px solid #2a2a3e',
        borderBottom: 'none',
      }}>
        <span style={{
          fontSize: '11px',
          color: '#8a8a9a',
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '1px',
        }}>
          {language}
        </span>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 212, 255, 0.1)',
            border: copied ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(0, 212, 255, 0.2)',
            borderRadius: '6px',
            color: copied ? '#10b981' : '#00d4ff',
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '0 0 8px 8px',
          fontSize: '12px',
          border: '1px solid #2a2a3e',
          borderTop: 'none',
        }}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  )
}

/**
 * Enhanced TutorPanel - AI Chat with Voice Input, Code Generation, 
 * Contextual Hints, Chat History, and Markdown Support
 */
const TutorPanel = forwardRef((props, ref) => {
  const { registerTutorPanel } = useAIMessage()
  const location = useLocation()
  
  // Chat state
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showHints, setShowHints] = useState(true)
  const [chatHistory, setChatHistory] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(true)
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'
        
        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('')
          setInputValue(transcript)
        }
        
        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }
      } else {
        setSpeechSupported(false)
      }
    } else {
      setSpeechSupported(false)
    }
  }, [])

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('quantara_chat_history')
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setChatHistory(parsed)
      } catch (e) {
        console.error('Failed to load chat history:', e)
      }
    }
    
    // Load last conversation or create new one
    const lastConversationId = localStorage.getItem('quantara_last_conversation')
    if (lastConversationId) {
      const savedConversations = localStorage.getItem('quantara_conversations')
      if (savedConversations) {
        const conversations = JSON.parse(savedConversations)
        const lastConv = conversations.find(c => c.id === lastConversationId)
        if (lastConv && lastConv.messages.length > 0) {
          setMessages(lastConv.messages)
          setCurrentConversationId(lastConversationId)
          return
        }
      }
    }
    
    // Create new conversation if none exists
    startNewConversation()
  }, [])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0 && currentConversationId) {
      saveConversation(currentConversationId, messages)
    }
  }, [messages, currentConversationId])

  // Register with AIMessageContext
  useImperativeHandle(ref, () => ({
    addMessage: (content) => {
      const aiMessage = {
        id: Date.now(),
        role: 'ai',
        content: content,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, aiMessage])
    }
  }))

  useEffect(() => {
    registerTutorPanel(ref)
  }, [ref, registerTutorPanel])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Get contextual hints based on current route
  const getContextualHints = useCallback(() => {
    const path = location.pathname
    return CONTEXT_HINTS[path] || CONTEXT_HINTS['/']
  }, [location.pathname])

  // Start a new conversation
  const startNewConversation = () => {
    const newId = `conv_${Date.now()}`
    setCurrentConversationId(newId)
    setMessages([{
      id: Date.now(),
      role: 'ai',
      content: "Welcome to Quantara! I'm your quantum computing assistant. Ask me about qubits, quantum gates, superposition, or entanglement.",
      timestamp: new Date().toISOString(),
    }])
    localStorage.setItem('quantara_last_conversation', newId)
  }

  // Save conversation to localStorage
  const saveConversation = (conversationId, conversationMessages) => {
    const savedConversations = localStorage.getItem('quantara_conversations')
    let conversations = savedConversations ? JSON.parse(savedConversations) : []
    
    const existingIndex = conversations.findIndex(c => c.id === conversationId)
    const conversation = {
      id: conversationId,
      messages: conversationMessages,
      title: conversationMessages.find(m => m.role === 'user')?.content?.substring(0, 30) || 'New Chat',
      updatedAt: new Date().toISOString()
    }
    
    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation
    } else {
      conversations.push(conversation)
    }
    
    // Keep only last 50 conversations
    conversations = conversations.slice(-50)
    
    localStorage.setItem('quantara_conversations', JSON.stringify(conversations))
    setChatHistory(conversations)
  }

  // Load a conversation from history
  const loadConversation = (conversationId) => {
    const savedConversations = localStorage.getItem('quantara_conversations')
    if (savedConversations) {
      const conversations = JSON.parse(savedConversations)
      const conv = conversations.find(c => c.id === conversationId)
      if (conv) {
        setMessages(conv.messages)
        setCurrentConversationId(conversationId)
        localStorage.setItem('quantara_last_conversation', conversationId)
        setShowHistory(false)
      }
    }
  }

  // Delete a conversation
  const deleteConversation = (e, conversationId) => {
    e.stopPropagation()
    const savedConversations = localStorage.getItem('quantara_conversations')
    if (savedConversations) {
      let conversations = JSON.parse(savedConversations)
      conversations = conversations.filter(c => c.id !== conversationId)
      localStorage.setItem('quantara_conversations', JSON.stringify(conversations))
      setChatHistory(conversations)
      
      if (conversationId === currentConversationId) {
        startNewConversation()
      }
    }
  }

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (!speechSupported) {
      // Show a friendly message instead of alert
      return
    }
    
    if (!recognitionRef.current) {
      return
    }
    
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  // Check if message contains code generation request
  const detectCodeGeneration = (text) => {
    const codeKeywords = [
      'generate code', 'write code', 'create code', 'show me code',
      'python code', 'q# code', 'qsharp code', 'implement',
      'how to write', 'code for', 'circuit code'
    ]
    const lowerText = text.toLowerCase()
    return codeKeywords.some(keyword => lowerText.includes(keyword))
  }

  // Extract gate names from text for code generation
  const extractGates = (text) => {
    const gateNames = ['H', 'X', 'Y', 'Z', 'S', 'T', 'CX', 'CNOT']
    const found = []
    const upperText = text.toUpperCase()
    gateNames.forEach(gate => {
      if (upperText.includes(gate)) {
        found.push(gate)
      }
    })
    return found.length > 0 ? found : ['H', 'X']
  }

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    const question = inputValue.trim()
    setInputValue('')
    setIsLoading(true)
    setShowHints(false)

    // Check for code generation request
    const needsCodeGeneration = detectCodeGeneration(question)
    
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: question,
          code_generation: needsCodeGeneration
        })
      })

      if (response.ok) {
        const data = await response.json()
        let answerContent = data.answer
        
        // If code generation was requested, add the code
        if (needsCodeGeneration) {
          const gates = extractGates(question)
          const pythonCode = CODE_TEMPLATES.python_qiskit(gates)
          const qsharpCode = CODE_TEMPLATES.qsharp(gates)
          
          answerContent += `\n\n### Python (Qiskit)\n\n\`\`\`python\n${pythonCode}\n\`\`\`\n\n### Q#\n\n\`\`\`qsharp\n${qsharpCode}\n\`\`\``
        }
        
        const aiMessage = {
          id: Date.now() + 1,
          role: 'ai',
          content: answerContent,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error('API request failed')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Check for specific error types
      let errorMessage = 'Failed to get response from AI assistant.'
      
      if (error.message && error.message.includes('429')) {
        errorMessage = 'The AI service is currently unavailable due to API quota limits. Please try again in a few moments when the quota resets.'
      } else if (error.message && error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.'
      } else if (error.message && error.message.includes('quota')) {
        errorMessage = 'API usage limit reached. Please wait a moment before trying again.'
      }
      
      // Show error message in chat instead of crashing
      const errorMsg = {
        id: Date.now() + 1,
        role: 'ai',
        content: `⚠️ ${errorMessage}`,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Format timestamp
  const getTimeString = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Format date for chat history
  const getDateString = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{
      height: '100%',
      background: 'linear-gradient(180deg, #0d0d14 0%, #0a0a0f 100%)',
      borderLeft: '1px solid #1a1a2e',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #1a1a2e',
        background: '#0d0d14',
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '10px',
          marginBottom: '4px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>⚛</span>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: 600,
              color: '#fff',
              fontFamily: 'Orbitron, sans-serif',
              letterSpacing: '1px',
            }}>
              QUANTUM AI
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowHistory(!showHistory)}
              title="Chat History"
              style={{
                background: 'transparent',
                border: 'none',
                color: showHistory ? '#00d4ff' : '#666',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              📜
            </button>
            <button
              onClick={startNewConversation}
              title="New Chat"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              ➕
            </button>
          </div>
        </div>
        <div style={{ fontSize: '11px', color: '#10b981' }}>
          <span style={{ marginRight: '6px' }}>●</span>
          Online • {isListening ? 'Listening...' : 'Ready'}
        </div>
      </div>

      {/* Chat History Panel */}
      {showHistory && (
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #1a1a2e',
          background: '#0d0d14',
          maxHeight: '200px',
          overflow: 'auto',
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
            Previous Conversations
          </div>
          {chatHistory.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#444', fontStyle: 'italic' }}>
              No chat history yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {chatHistory.slice().reverse().map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: conv.id === currentConversationId ? '#1a1a2e' : 'transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: '1px solid #1a1a2e',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', color: '#fff' }}>
                      {conv.title || 'New Chat'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#666' }}>
                      {getDateString(conv.updatedAt)} • {conv.messages.length} messages
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteConversation(e, conv.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#666',
                      cursor: 'pointer',
                      padding: '4px',
                      fontSize: '12px',
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contextual Hints */}
      {showHints && messages.length <= 1 && (
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #1a1a2e',
          background: '#0d0d14',
        }}>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Suggested Questions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {getContextualHints().map((hint, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputValue(hint)
                  setTimeout(() => handleSendMessage(), 100)
                }}
                style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  background: '#1a1a2e',
                  border: '1px solid #2a2a3e',
                  borderRadius: '6px',
                  color: '#aaa',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#00d4ff50'
                  e.target.style.color = '#fff'
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#2a2a3e'
                  e.target.style.color = '#aaa'
                }}
              >
                {hint}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              padding: message.role === 'user' ? '14px 18px' : '16px 20px',
              borderRadius: message.role === 'user' 
                ? '18px 18px 4px 18px' 
                : '18px 18px 18px 4px',
              maxWidth: '92%',
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              background: message.role === 'user'
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(139, 92, 246, 0.1))'
                : 'linear-gradient(135deg, #1a1a2e, #12121a)',
              border: message.role === 'user'
                ? '1px solid rgba(139, 92, 246, 0.4)'
                : '1px solid rgba(0, 212, 255, 0.15)',
              boxShadow: message.role === 'user'
                ? '0 4px 20px rgba(139, 92, 246, 0.2)'
                : '0 2px 15px rgba(0, 0, 0, 0.3)',
              position: 'relative',
            }}
          >
            {/* Role indicator dot */}
            <div style={{
              position: 'absolute',
              top: message.role === 'user' ? '-6px' : '-6px',
              right: message.role === 'user' ? 'auto' : '-6px',
              left: message.role === 'user' ? '-6px' : 'auto',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: message.role === 'user' 
                ? 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
                : 'linear-gradient(135deg, #00d4ff, #06b6d4)',
              boxShadow: message.role === 'user'
                ? '0 0 10px rgba(139, 92, 246, 0.5)'
                : '0 0 10px rgba(0, 212, 255, 0.5)',
            }} />
            
            <div style={{ 
              fontSize: '14px', 
              color: '#e0e0e8', 
              lineHeight: '1.6',
              wordBreak: 'break-word',
            }}>
              {message.role === 'ai' ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{ code: CodeRenderer }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                message.content
              )}
            </div>
            <div style={{ 
              fontSize: '10px', 
              color: '#4a4a5a', 
              marginTop: '10px',
              textAlign: message.role === 'user' ? 'right' : 'left',
            }}>
              {message.role === 'user' ? 'You' : '⚛ Quantara'} • {getTimeString(message.timestamp)}
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              padding: '16px 20px',
              borderRadius: '18px 18px 18px 4px',
              background: 'linear-gradient(135deg, #1a1a2e, #12121a)',
              border: '1px solid rgba(0, 212, 255, 0.15)',
              maxWidth: '60%',
              alignSelf: 'flex-start',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Animated typing dots */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{
                      opacity: [0.4, 1, 0.4],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6,
                      delay: i * 0.15,
                      ease: 'easeInOut',
                    }}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#00d4ff',
                    }}
                  />
                ))}
              </div>
              <span style={{ color: '#8a8a9a', fontSize: '13px' }}>
                Thinking...
              </span>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #1a1a2e',
        background: '#0d0d14',
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            placeholder={isListening ? "Listening..." : "Ask a question..."}
            style={{
              flex: 1,
              background: '#0a0a0f',
              border: `1px solid ${isListening ? '#10b981' : '#1a1a2e'}`,
              borderRadius: '8px',
              padding: '10px 12px',
              color: '#fff',
              fontSize: '13px',
              resize: 'none',
              minHeight: '44px',
              maxHeight: '100px',
              outline: 'none',
              transition: 'border-color 0.2s',
              fontFamily: 'inherit',
            }}
          />
          {/* Markdown Preview Toggle */}
          <button
            onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
            title={showMarkdownPreview ? "Edit mode" : "Preview mode"}
            style={{
              width: '36px',
              height: '36px',
              background: showMarkdownPreview ? '#00d4ff30' : '#1a1a2e',
              border: `1px solid ${showMarkdownPreview ? '#00d4ff' : '#2a2a3e'}`,
              borderRadius: '8px',
              color: showMarkdownPreview ? '#00d4ff' : '#888',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            👁
          </button>
          {/* Voice Input Button - only show if supported */}
          {speechSupported ? (
            <button
              onClick={toggleVoiceInput}
              disabled={isLoading}
              title={isListening ? "Stop listening" : "Voice input"}
              style={{
                width: '36px',
                height: '36px',
                background: isListening ? '#10b98130' : '#1a1a2e',
                border: `1px solid ${isListening ? '#10b981' : '#2a2a3e'}`,
                borderRadius: '8px',
                color: isListening ? '#10b981' : '#888',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              🎤
            </button>
          ) : (
            <button
              disabled
              title="Voice input not supported in this browser"
              style={{
                width: '36px',
                height: '36px',
                background: '#1a1a2e',
                border: '1px solid #2a2a3e',
                borderRadius: '8px',
                color: '#444',
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                flexShrink: 0,
                opacity: 0.5,
              }}
            >
              🎤
            </button>
          )}
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            style={{
              width: '44px',
              height: '44px',
              background: '#00d4ff20',
              border: '1px solid #00d4ff50',
              borderRadius: '8px',
              color: '#00d4ff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              opacity: isLoading || !inputValue.trim() ? 0.5 : 1,
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            ➤
          </button>
        </div>
        <div style={{ 
          marginTop: '8px', 
          fontSize: '10px', 
          color: '#444',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>💡 Try: "generate code for H gate"</span>
          <span>Supports Markdown & LaTeX</span>
        </div>
      </div>
    </div>
  )
})

TutorPanel.displayName = 'TutorPanel'

export default TutorPanel
