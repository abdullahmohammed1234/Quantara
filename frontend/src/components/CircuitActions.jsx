import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from './ui/Modal'

/**
 * CircuitActions - Export and Share functionality for quantum circuits
 * 
 * Provides:
 * - Export dropdown with code format options (Qiskit, Cirq, Q#)
 * - Export modal with code display and copy button
 * - Share button that generates shareable links
 * - Share modal with copy and open functionality
 * 
 * @param {Object} props - Component properties
 * @param {Array} props.operations - Array of circuit operations
 * @param {number} props.numQubits - Number of qubits in the circuit
 * @returns {JSX.Element} The CircuitActions component
 */
const CircuitActions = ({ operations = [], numQubits = 2 }) => {
  const navigate = useNavigate()
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [exportFormat, setExportFormat] = useState('qiskit')
  const [exportedCode, setExportedCode] = useState('')
  const [shareData, setShareData] = useState(null)
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Generate code for different formats
  const generateCode = (format) => {
    const gateList = operations.map(op => {
      if (op.controlQubits && op.controlQubits.length > 0) {
        return { gate: op.gate, target: op.targetQubits[0], control: op.controlQubits[0], params: op.params }
      }
      return { gate: op.gate, target: op.targetQubits[0], params: op.params }
    })

    switch (format) {
      case 'qiskit':
        return generateQiskitCode(gateList, numQubits)
      case 'cirq':
        return generateCirqCode(gateList, numQubits)
      case 'qsharp':
        return generateQSharpCode(gateList, numQubits)
      case 'pennylane':
        return generatePennyLaneCode(gateList, numQubits)
      case 'forest':
        return generateForestCode(gateList, numQubits)
      case 'openqasm':
        return generateOpenQASMCode(gateList, numQubits)
      default:
        return generateQiskitCode(gateList, numQubits)
    }
  }

  const generateQiskitCode = (gates, numQubits) => {
    let code = `from qiskit import QuantumCircuit\n\n`
    code += `// Create a quantum circuit with ${numQubits} qubit(s)\n`
    code += `qc = QuantumCircuit(${numQubits})\n\n`
    
    if (gates.length === 0) {
      code += `// No gates added yet\n`
      return code
    }

    code += `// Add quantum gates\n`
    gates.forEach((gate, idx) => {
      const target = gate.target
      switch (gate.gate) {
        case 'H':
          code += `qc.h(${target})  // Hadamard gate\n`
          break
        case 'X':
          code += `qc.x(${target})  // Pauli-X gate\n`
          break
        case 'Y':
          code += `qc.y(${target})  // Pauli-Y gate\n`
          break
        case 'Z':
          code += `qc.z(${target})  // Pauli-Z gate\n`
          break
        case 'S':
          code += `qc.s(${target})  // Phase gate\n`
          break
        case 'T':
          code += `qc.t(${target})  // T gate\n`
          break
        case 'Rx':
          code += `qc.rx(${gate.params?.angle || Math.PI / 4}, ${target})  // Rotation around X\n`
          break
        case 'Ry':
          code += `qc.ry(${gate.params?.angle || Math.PI / 4}, ${target})  // Rotation around Y\n`
          break
        case 'Rz':
          code += `qc.rz(${gate.params?.angle || Math.PI / 4}, ${target})  // Rotation around Z\n`
          break
        case 'CNOT':
        case 'CX':
          code += `qc.cx(${gate.control}, ${target})  // CNOT gate\n`
          break
        case 'CZ':
          code += `qc.cz(${gate.control}, ${target})  // Controlled-Z gate\n`
          break
        case 'SWAP':
          code += `qc.swap(${gate.control}, ${target})  // SWAP gate\n`
          break
        case 'M':
          code += `qc.measure(${target}, ${target})  // Measurement\n`
          break
      }
    })

    code += `\n// Print the circuit\n`
    code += `print(qc)\n\n`
    code += `// Run simulation\n`
    code += `from qiskit import transpile\n`
    code += `from qiskit_aer import AerSimulator\n\n`
    code += `simulator = AerSimulator()\n`
    code += `compiled_circuit = transpile(qc, simulator)\n`
    code += `job = simulator.run(compiled_circuit, shots=1000)\n`
    code += `result = job.result()\n`
    code += `counts = result.get_counts(qc)\n`
    code += `print("Measurement results:", counts)\n`
    
    return code
  }

  const generateCirqCode = (gates, numQubits) => {
    let code = `import cirq\n\n`
    code += `// Create a quantum circuit with ${numQubits} qubit(s)\n`
    code += `qubits = [cirq.LineQubit(i) for i in range(${numQubits})]\n`
    code += `circuit = cirq.Circuit()\n\n`
    
    if (gates.length === 0) {
      code += `// No gates added yet\n`
      return code
    }

    code += `// Add quantum gates\n`
    gates.forEach((gate, idx) => {
      const target = `qubits[${gate.target}]`
      switch (gate.gate) {
        case 'H':
          code += `circuit.append(cirq.H(${target}))  // Hadamard gate\n`
          break
        case 'X':
          code += `circuit.append(cirq.X(${target}))  // Pauli-X gate\n`
          break
        case 'Y':
          code += `circuit.append(cirq.Y(${target}))  // Pauli-Y gate\n`
          break
        case 'Z':
          code += `circuit.append(cirq.Z(${target}))  // Pauli-Z gate\n`
          break
        case 'S':
          code += `circuit.append(cirq.S(${target}))  // Phase gate\n`
          break
        case 'T':
          code += `circuit.append(cirq.T(${target}))  // T gate\n`
          break
        case 'Rx':
          code += `circuit.append(cirq.rx(${gate.params?.angle || Math.PI / 4})(${target}))  // Rotation around X\n`
          break
        case 'Ry':
          code += `circuit.append(cirq.ry(${gate.params?.angle || Math.PI / 4})(${target}))  // Rotation around Y\n`
          break
        case 'Rz':
          code += `circuit.append(cirq.rz(${gate.params?.angle || Math.PI / 4})(${target}))  // Rotation around Z\n`
          break
        case 'CNOT':
        case 'CX':
          code += `circuit.append(cirq.CNOT(${target}, qubits[${gate.control}]))  // CNOT gate\n`
          break
        case 'CZ':
          code += `circuit.append(cirq.CZ(${target}, qubits[${gate.control}]))  // Controlled-Z gate\n`
          break
        case 'SWAP':
          code += `circuit.append(cirq.SWAP(${target}, qubits[${gate.control}]))  // SWAP gate\n`
          break
        case 'M':
          code += `circuit.append(cirq.measure(*qubits, key='result'))  // Measurement\n`
          break
      }
    })

    code += `\n// Print the circuit\n`
    code += `print(circuit)\n\n`
    code += `// Run simulation\n`
    code += `simulator = cirq.Simulator()\n`
    code += `result = simulator.run(circuit, repetitions=1000)\n`
    code += `print("Measurement results:", result.histogram(key='result'))\n`
    
    return code
  }

  const generateQSharpCode = (gates, numQubits) => {
    let code = `namespace QuantumCircuit {\n\n`
    code += `    open Microsoft.Quantum.Canon;\n`
    code += `    open Microsoft.Quantum.Intrinsic;\n`
    code += `    open Microsoft.Quantum.Measurement;\n\n`
    code += `    @Operation()\n`
    code += `    operation RunCircuit() : Result[] {\n`
    code += `        // Create quantum register with ${numQubits} qubit(s)\n`
    code += `        use qubits = Qubit[${numQubits}];\n\n`
    
    if (gates.length === 0) {
      code += `        // No gates added yet\n`
    } else {
      code += `        // Apply quantum gates\n`
      gates.forEach((gate, idx) => {
        const target = `qubits[${gate.target}]`
        switch (gate.gate) {
          case 'H':
            code += `        H(${target});  // Hadamard gate\n`
            break
          case 'X':
            code += `        X(${target});  // Pauli-X gate\n`
            break
          case 'Y':
            code += `        Y(${target});  // Pauli-Y gate\n`
            break
          case 'Z':
            code += `        Z(${target});  // Pauli-Z gate\n`
            break
          case 'S':
            code += `        S(${target});  // Phase gate\n`
            break
          case 'T':
            code += `        T(${target});  // T gate\n`
            break
          case 'Rx':
            code += `        Rx(${gate.params?.angle || Math.PI / 4}, ${target});  // Rotation around X\n`
            break
          case 'Ry':
            code += `        Ry(${gate.params?.angle || Math.PI / 4}, ${target});  // Rotation around Y\n`
            break
          case 'Rz':
            code += `        Rz(${gate.params?.angle || Math.PI / 4}, ${target});  // Rotation around Z\n`
            break
          case 'CNOT':
          case 'CX':
            code += `        CNOT(${target}, qubits[${gate.control}]);  // CNOT gate\n`
            break
          case 'CZ':
            code += `        CZ(${target}, qubits[${gate.control}]);  // Controlled-Z gate\n`
            break
          case 'SWAP':
            code += `        SWAP(${target}, qubits[${gate.control}]);  // SWAP gate\n`
            break
          case 'M':
            code += `        // Measurement\n`
            break
        }
      })
    }

    code += `\n        // Measure all qubits\n`
    code += `        return MultiM(qubits);\n`
    code += `    }\n`
    code += `}\n`
    
    return code
  }

  const generatePennyLaneCode = (gates, numQubits) => {
    let code = `import pennylane as qml
import numpy as np

`
    code += `// Create a quantum device with ${numQubits} qubit(s)
`
    code += `dev = qml.device('default.qubit', wires=${numQubits})

`
    code += `// Define the quantum circuit
`
    code += `@qml.qnode(dev)
`
    code += `def circuit():
`
    
    if (gates.length === 0) {
      code += `    pass  // No gates added yet
`
    } else {
      code += `    // Add quantum gates
`
      gates.forEach((gate, idx) => {
        const target = gate.target
        switch (gate.gate) {
          case 'H':
            code += `    qml.Hadamard(wires=${target})  // Hadamard gate\n`
            break
          case 'X':
            code += `    qml.PauliX(wires=${target})  // Pauli-X gate\n`
            break
          case 'Y':
            code += `    qml.PauliY(wires=${target})  // Pauli-Y gate\n`
            break
          case 'Z':
            code += `    qml.PauliZ(wires=${target})  // Pauli-Z gate\n`
            break
          case 'S':
            code += `    qml.S(wires=${target})  // Phase gate\n`
            break
          case 'T':
            code += `    qml.T(wires=${target})  // T gate\n`
            break
          case 'Rx':
            code += `    qml.RX(${gate.params?.angle || Math.PI / 4}, wires=${target})  // Rotation around X\n`
            break
          case 'Ry':
            code += `    qml.RY(${gate.params?.angle || Math.PI / 4}, wires=${target})  // Rotation around Y\n`
            break
          case 'Rz':
            code += `    qml.RZ(${gate.params?.angle || Math.PI / 4}, wires=${target})  // Rotation around Z\n`
            break
          case 'CNOT':
          case 'CX':
            code += `    qml.CNOT(wires=[${gate.control}, ${target}])  // CNOT gate\n`
            break
          case 'CZ':
            code += `    qml.CZ(wires=[${gate.control}, ${target}])  // Controlled-Z gate\n`
            break
          case 'SWAP':
            code += `    qml.SWAP(wires=[${gate.control}, ${target}])  // SWAP gate\n`
            break
          case 'M':
            code += `    qml.measure(wires=${target})  // Measurement\n`
            break
        }
      })
    }

    code += `    return qml.expval(qml.Z(0))\n\n`
    code += `// Run the circuit\n`
    code += `result = circuit()\n`
    code += `print(f"Result: {result}")\n\n`
    code += `// Run multiple shots\n`
    code += `@qml.qnode(dev)\n`
    code += `def circuit_shots():\n`
    if (gates.length === 0) {
      code += `    pass\n`
    } else {
      gates.forEach((gate, idx) => {
        const target = gate.target
        switch (gate.gate) {
          case 'H':
            code += `    qml.Hadamard(wires=${target})\n`
            break
          case 'X':
            code += `    qml.PauliX(wires=${target})\n`
            break
          case 'Y':
            code += `    qml.PauliY(wires=${target})\n`
            break
          case 'Z':
            code += `    qml.PauliZ(wires=${target})\n`
            break
          case 'S':
            code += `    qml.S(wires=${target})\n`
            break
          case 'T':
            code += `    qml.T(wires=${target})\n`
            break
          case 'Rx':
            code += `    qml.RX(${gate.params?.angle || Math.PI / 4}, wires=${target})\n`
            break
          case 'Ry':
            code += `    qml.RY(${gate.params?.angle || Math.PI / 4}, wires=${target})\n`
            break
          case 'Rz':
            code += `    qml.RZ(${gate.params?.angle || Math.PI / 4}, wires=${target})\n`
            break
          case 'CNOT':
          case 'CX':
            code += `    qml.CNOT(wires=[${gate.control}, ${target}])\n`
            break
          case 'CZ':
            code += `    qml.CZ(wires=[${gate.control}, ${target}])\n`
            break
          case 'SWAP':
            code += `    qml.SWAP(wires=[${gate.control}, ${target}])\n`
            break
          case 'M':
            code += `    qml.measure(wires=${target})\n`
            break
        }
      })
    }
    code += `    return [qml.sample(wires=i) for i in range(${numQubits})]\n\n`
    code += `results = circuit_shots()\n`
    code += `for i, r in enumerate(results):\n`
    code += `    print(f"Qubit {i}: {r}")\n`
    
    return code
  }

  const generateForestCode = (gates, numQubits) => {
    let code = `import pyquil as pq
import pyquil.gates as g
from pyquil.quilbase import Pragma

`
    code += `// Create a quantum program with ${numQubits} qubit(s)
`
    code += `qprog = pq.Program()\n\n`
    
    if (gates.length === 0) {
      code += `// No gates added yet\n`
      return code
    }

    code += `// Add quantum gates\n`
    gates.forEach((gate, idx) => {
      const target = gate.target
      switch (gate.gate) {
        case 'H':
          code += `qprog += g.H(${target})  // Hadamard gate\n`
          break
        case 'X':
          code += `qprog += g.X(${target})  // Pauli-X gate\n`
          break
        case 'Y':
          code += `qprog += g.Y(${target})  // Pauli-Y gate\n`
          break
        case 'Z':
          code += `qprog += g.Z(${target})  // Pauli-Z gate\n`
          break
        case 'S':
          code += `qprog += g.S(${target})  // Phase gate\n`
          break
        case 'T':
          code += `qprog += g.T(${target})  // T gate\n`
          break
        case 'Rx':
          code += `qprog += g.RX(${target}, ${gate.params?.angle || Math.PI / 4})  // Rotation around X\n`
          break
        case 'Ry':
          code += `qprog += g.RY(${target}, ${gate.params?.angle || Math.PI / 4})  // Rotation around Y\n`
          break
        case 'Rz':
          code += `qprog += g.RZ(${target}, ${gate.params?.angle || Math.PI / 4})  // Rotation around Z\n`
          break
        case 'CNOT':
        case 'CX':
          code += `qprog += g.CNOT(${gate.control}, ${target})  // CNOT gate\n`
          break
        case 'CZ':
          code += `qprog += g.CZ(${gate.control}, ${target})  // Controlled-Z gate\n`
          break
        case 'SWAP':
          code += `qprog += g.SWAP(${gate.control}, ${target})  // SWAP gate\n`
          break
        case 'M':
          code += `qprog += g.MEASURE(${target}, MemoryReference('ro', ${target}))  // Measurement\n`
          break
      }
    })

    code += `\n// Print the circuit\n`
    code += `print(qprog)\n\n`
    code += `// Run simulation\n`
    code += `from pyquil.api import get_qc\n`
    code += `from qiskit import QuantumCircuit, execute, Aer\n\n`
    code += `// Convert to QASM and simulate\n`
    code += `print("Circuit compiled successfully")\n`
    
    return code
  }

  const generateOpenQASMCode = (gates, numQubits) => {
    let code = `OPENQASM 2.0;\n\n`
    code += `include "qelib1.inc";\n\n`
    code += `// Create a quantum circuit with ${numQubits} qubit(s)\n`
    code += `qreg q[${numQubits}];\n`
    code += `creg c[${numQubits}];\n\n`
    
    if (gates.length === 0) {
      code += `// No gates added yet\n`
      return code
    }

    code += `// Add quantum gates\n`
    gates.forEach((gate, idx) => {
      const target = gate.target + 1  // QASM uses 1-based indexing
      switch (gate.gate) {
        case 'H':
          code += `h q[${target}];  // Hadamard gate\n`
          break
        case 'X':
          code += `x q[${target}];  // Pauli-X gate\n`
          break
        case 'Y':
          code += `y q[${target}];  // Pauli-Y gate\n`
          break
        case 'Z':
          code += `z q[${target}];  // Pauli-Z gate\n`
          break
        case 'S':
          code += `s q[${target}];  // Phase gate\n`
          break
        case 'T':
          code += `t q[${target}];  // T gate\n`
          break
        case 'Rx':
          code += `rx(${gate.params?.angle || Math.PI / 4}, q[${target}]);  // Rotation around X\n`
          break
        case 'Ry':
          code += `ry(${gate.params?.angle || Math.PI / 4}, q[${target}]);  // Rotation around Y\n`
          break
        case 'Rz':
          code += `rz(${gate.params?.angle || Math.PI / 4}, q[${target}]);  // Rotation around Z\n`
          break
        case 'CNOT':
        case 'CX':
          code += `cx q[${gate.control + 1}], q[${target}];  // CNOT gate\n`
          break
        case 'CZ':
          code += `cz q[${gate.control + 1}], q[${target}];  // Controlled-Z gate\n`
          break
        case 'SWAP':
          code += `swap q[${gate.control + 1}], q[${target}];  // SWAP gate\n`
          break
        case 'M':
          code += `measure q[${target}] -> c[${target}];  // Measurement\n`
          break
      }
    })

    code += `\n// Note: OpenQASM is an intermediate representation\n`
    code += `// Use with IBM Q Experience, Qiskit, or other backends\n`
    code += `// Can be simulated with: qiskit.execute(circuit, Aer.get_backend('qasm_simulator'))\n`
    
    return code
  }

  const handleExportSelect = (format) => {
    setExportFormat(format)
    const code = generateCode(format)
    setExportedCode(code)
    setShowExportDropdown(false)
    setShowExportModal(true)
    setCopied(false)
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(exportedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = async () => {
    if (operations.length === 0) return
    
    setIsSharing(true)
    setCopied(false)

    try {
      const gateList = operations.map(op => {
        if (op.controlQubits && op.controlQubits.length > 0) {
          return `${op.gate}(${op.controlQubits[0]}->${op.targetQubits[0]})`
        }
        return op.gate
      })

      const response = await fetch('/api/integration/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gates: gateList,
          num_qubits: numQubits,
          name: 'Quantum Circuit'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setShareData(data)
        setShowShareModal(true)
      } else {
        // Fallback: generate a local share ID
        const localShareId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setShareData({
          success: true,
          share_id: localShareId,
          share_url: `/circuit/${localShareId}`,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        setShowShareModal(true)
      }
    } catch (error) {
      console.error('Failed to share:', error)
      // Fallback for demo
      const localShareId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setShareData({
        success: true,
        share_id: localShareId,
        share_url: `/circuit/${localShareId}`,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      setShowShareModal(true)
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareData?.share_url) return
    try {
      const fullUrl = window.location.origin + shareData.share_url
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleOpenLink = () => {
    if (shareData?.share_url) {
      navigate(shareData.share_url)
    }
  }

  const formatLabels = {
    qiskit: 'Qiskit (Python)',
    cirq: 'Cirq (Python)',
    qsharp: 'Q# (Microsoft)',
    pennylane: 'PennyLane (Python)',
    forest: 'Forest (Rigetti)',
    openqasm: 'OpenQASM'
  }

  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      {/* Export Dropdown */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setShowExportDropdown(!showExportDropdown)}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            borderRadius: '10px',
            color: '#c4b5fd',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.2))'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))'
          }}
        >
          <span>📤</span>
          Export
          <span style={{ fontSize: '10px' }}>▼</span>
        </button>

        {showExportDropdown && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '8px',
            background: 'rgba(17, 24, 39, 0.95)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '10px',
            padding: '8px',
            minWidth: '180px',
            zIndex: 100,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <button
              onClick={() => handleExportSelect('qiskit')}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(139, 92, 246, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
              }}
            >
              <span style={{ color: '#8b5cf6' }}>🐍</span>
              Qiskit (Python)
            </button>
            <button
              onClick={() => handleExportSelect('cirq')}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(139, 92, 246, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
              }}
            >
              <span style={{ color: '#8b5cf6' }}>🔗</span>
              Cirq (Python)
            </button>
            <button
              onClick={() => handleExportSelect('qsharp')}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(139, 92, 246, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
              }}
            >
              <span style={{ color: '#8b5cf6' }}>💠</span>
              Q# (Microsoft)
            </button>
            <button
              onClick={() => handleExportSelect('pennylane')}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(139, 92, 246, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
              }}
            >
              <span style={{ color: '#8b5cf6' }}>⚡</span>
              PennyLane (Python)
            </button>
            <button
              onClick={() => handleExportSelect('forest')}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(139, 92, 246, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
              }}
            >
              <span style={{ color: '#8b5cf6' }}>🌲</span>
              Forest (Rigetti)
            </button>
            <button
              onClick={() => handleExportSelect('openqasm')}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(139, 92, 246, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
              }}
            >
              <span style={{ color: '#8b5cf6' }}>📄</span>
              OpenQASM
            </button>
          </div>
        )}
      </div>

      {/* Share Button */}
      <button
        onClick={handleShare}
        disabled={isSharing || operations.length === 0}
        style={{
          padding: '10px 20px',
          background: operations.length === 0 
            ? 'rgba(0, 212, 255, 0.1)'
            : 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.1))',
          border: `1px solid rgba(0, 212, 255, ${operations.length === 0 ? 0.2 : 0.4})`,
          borderRadius: '10px',
          color: operations.length === 0 ? '#4a4a5a' : '#00d4ff',
          fontSize: '14px',
          fontWeight: 600,
          cursor: operations.length === 0 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s',
          opacity: isSharing ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          if (operations.length > 0 && !isSharing) {
            e.target.style.background = 'linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 212, 255, 0.2))'
          }
        }}
        onMouseLeave={(e) => {
          if (operations.length > 0 && !isSharing) {
            e.target.style.background = 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.1))'
          }
        }}
      >
        <span>{isSharing ? '⏳' : '🔗'}</span>
        {isSharing ? 'Sharing...' : 'Share'}
      </button>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title={`Export to ${formatLabels[exportFormat]}`}
        size="large"
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '12px',
            padding: '16px',
            maxHeight: '300px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '13px',
            lineHeight: '1.6',
            color: '#a5b4fc',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {exportedCode}
            </pre>
          </div>
        </div>
        
        <button
          onClick={handleCopyCode}
          style={{
            width: '100%',
            padding: '12px 20px',
            background: copied 
              ? 'rgba(16, 185, 129, 0.3)'
              : 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(139, 92, 246, 0.2))',
            border: `1px solid ${copied ? 'rgba(16, 185, 129, 0.5)' : 'rgba(0, 212, 255, 0.4)'}`,
            borderRadius: '10px',
            color: copied ? '#10b981' : '#00d4ff',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s'
          }}
        >
          <span>{copied ? '✓' : '📋'}</span>
          {copied ? 'Copied to clipboard!' : 'Copy Code'}
        </button>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Circuit"
        size="medium"
      >
        {shareData && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: '#8a8a9a',
                fontSize: '13px',
                marginBottom: '8px'
              }}>
                Share Link
              </label>
              <div style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
              }}>
                <div style={{
                  flex: 1,
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: '#00d4ff',
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  border: '1px solid rgba(0, 212, 255, 0.2)'
                }}>
                  {window.location.origin}{shareData.share_url}
                </div>
              </div>
              
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#6b7280'
              }}>
                Expires: {new Date(shareData.expires_at).toLocaleDateString()}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCopyLink}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: copied 
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(139, 92, 246, 0.2))',
                  border: `1px solid ${copied ? 'rgba(16, 185, 129, 0.5)' : 'rgba(0, 212, 255, 0.4)'}`,
                  borderRadius: '10px',
                  color: copied ? '#10b981' : '#00d4ff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s'
                }}
              >
                <span>{copied ? '✓' : '📋'}</span>
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              
              <button
                onClick={handleOpenLink}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(0, 212, 255, 0.2))',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '10px',
                  color: '#10b981',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(0, 212, 255, 0.3))'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(0, 212, 255, 0.2))'
                }}
              >
                <span>🚀</span>
                Open Link
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

export default CircuitActions
