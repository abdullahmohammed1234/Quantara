"""
Quantara Quantum Integration Services
======================================

This module provides integration with:
1. IBM Quantum Experience - Connect to real quantum computers
2. Qiskit Integration - Run actual quantum circuits
3. Export to Q# - Generate Microsoft Quantum code
4. Share Circuits - Generate shareable links

Author: Quantara AI Team
"""

import os
import json
import hashlib
import base64
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

# Import Qiskit
try:
    from qiskit import QuantumCircuit
    from qiskit_aer import AerSimulator
    from qiskit.circuit import Reset
    from qiskit.transpiler import generate_preset_pass_manager
    from qiskit.providers.basic_provider import BasicSimulator
    QISKIT_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Qiskit not available: {e}")
    QISKIT_AVAILABLE = False
    QuantumCircuit = None
    AerSimulator = None

# Try importing IBM Quantum Runtime
try:
    from qiskit_ibm_runtime import QiskitRuntimeService, Sampler, Estimator, Options
    IBM_RUNTIME_AVAILABLE = True
except ImportError:
    try:
        from qiskit import IBMQ
        IBM_RUNTIME_AVAILABLE = False  # Legacy IBMQ
    except ImportError:
        IBM_RUNTIME_AVAILABLE = False

# In-memory storage for shared circuits (would be database in production)
SHARED_CIRCUITS: Dict[str, Dict[str, Any]] = {}


# ============================================================================
# DATA MODELS
# ============================================================================

class QuantumCircuitInput(BaseModel):
    """Input for quantum circuit operations"""
    gates: List[str]  # List of gate names
    num_qubits: int = 1
    shots: int = 1000
    measurements: Optional[List[int]] = None


class IBMRunRequest(BaseModel):
    """Request to run on IBM Quantum"""
    circuit: QuantumCircuitInput
    backend_name: str = "ibmq_qasm_simulator"
    optimization_level: int = 1


class IBMRunResponse(BaseModel):
    """Response from IBM Quantum run"""
    success: bool
    job_id: Optional[str] = None
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    backend: Optional[str] = None
    execution_time: Optional[float] = None


class ExportRequest(BaseModel):
    """Request to export circuit to different formats"""
    circuit: QuantumCircuitInput
    format: str  # "qiskit", "qasm", "qsharp", "braket"


class ExportResponse(BaseModel):
    """Response with exported code"""
    success: bool
    format: str
    code: str
    error: Optional[str] = None


class ShareRequest(BaseModel):
    """Request to share a circuit"""
    circuit: QuantumCircuitInput
    name: str = "Untitled Circuit"
    description: str = ""


class ShareResponse(BaseModel):
    """Response with shareable link"""
    success: bool
    share_id: str
    share_url: str
    expires_at: str
    error: Optional[str] = None


class LoadSharedRequest(BaseModel):
    """Request to load a shared circuit"""
    share_id: str


class BackendInfo(BaseModel):
    """Information about available backends"""
    name: str
    description: str
    num_qubits: int
    status: str
    is_simulator: bool


# ============================================================================
# QISKIT INTEGRATION
# ============================================================================

def create_circuit_from_gates(gates: List[str], num_qubits: int = 1) -> Optional[QuantumCircuit]:
    """Create a Qiskit quantum circuit from a list of gate names"""
    if not QISKIT_AVAILABLE:
        return None
    
    try:
        qc = QuantumCircuit(num_qubits, num_qubits)
        
        for i, gate in enumerate(gates):
            gate = gate.upper().strip()
            qubit_idx = i % num_qubits  # Simple qubit mapping
            
            if gate == "H":
                qc.h(qubit_idx)
            elif gate == "X":
                qc.x(qubit_idx)
            elif gate == "Y":
                qc.y(qubit_idx)
            elif gate == "Z":
                qc.z(qubit_idx)
            elif gate == "S":
                qc.s(qubit_idx)
            elif gate == "T":
                qc.t(qubit_idx)
            elif gate == "CX" or gate == "CNOT":
                if num_qubits > 1:
                    qc.cx(0, 1)
            elif gate == "CZ":
                if num_qubits > 1:
                    qc.cz(0, 1)
            elif gate == "SWAP":
                if num_qubits > 1:
                    qc.swap(0, 1)
            elif gate == "CCX" or gate == "TOFFOLI":
                if num_qubits > 2:
                    qc.ccx(0, 1, 2)
            elif gate == "RESET":
                qc.reset(qubit_idx)
            # Skip unknown gates silently
            
        # Add measurements
        qc.measure_all()
        
        return qc
        
    except Exception as e:
        print(f"Error creating circuit: {e}")
        return None


def run_circuit_local(circuit_input: QuantumCircuitInput) -> Dict[str, Any]:
    """Run quantum circuit on local simulator"""
    if not QISKIT_AVAILABLE:
        return {
            "success": False,
            "error": "Qiskit not available",
            "probabilities": {"0": 0.5, "1": 0.5}
        }
    
    try:
        # Create circuit
        qc = create_circuit_from_gates(circuit_input.gates, circuit_input.num_qubits)
        
        if qc is None:
            return {
                "success": False,
                "error": "Failed to create circuit"
            }
        
        # Choose simulator
        try:
            simulator = AerSimulator()
        except:
            simulator = BasicSimulator()
        
        # Run simulation
        result = simulator.run(qc, shots=circuit_input.shots).result()
        counts = result.get_counts(qc)
        
        # Calculate probabilities
        total = sum(counts.values())
        probabilities = {
            state: round(count / total, 4) 
            for state, count in counts.items()
        }
        
        return {
            "success": True,
            "counts": counts,
            "probabilities": probabilities,
            "shots": circuit_input.shots,
            "circuit_depth": qc.depth(),
            "num_qubits": circuit_input.num_qubits
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ============================================================================
# IBM QUANTUM EXPERIENCE INTEGRATION
# ============================================================================

def get_ibm_backends() -> List[BackendInfo]:
    """Get list of available IBM Quantum backends"""
    backends = []
    
    if not IBM_RUNTIME_AVAILABLE:
        # Return simulated backends for demo
        backends = [
            BackendInfo(
                name="ibmq_qasm_simulator",
                description="High-performance simulator",
                num_qubits=500,
                status="available",
                is_simulator=True
            ),
            BackendInfo(
                name="ibmq_statevector_simulator",
                description="Statevector simulator",
                num_qubits=32,
                status="available",
                is_simulator=True
            ),
            BackendInfo(
                name="simulator_mps",
                description="Matrix Product State simulator",
                num_qubits=100,
                status="available",
                is_simulator=True
            ),
        ]
        
        # Add available real backends (would require credentials)
        # In production, query actual IBM Quantum account
        backends.extend([
            BackendInfo(
                name="ibm_brisbane",
                description="127-qubit IBM Brisbane (requires credentials)",
                num_qubits=127,
                status="requires_credentials",
                is_simulator=False
            ),
            BackendInfo(
                name="ibm_sherbrooke",
                description="156-qubit IBM Sherbrooke (requires credentials)",
                num_qubits=156,
                status="requires_credentials",
                is_simulator=False
            ),
            BackendInfo(
                name="ibm_kobe",
                description="64-qubit IBM Kobe (requires credentials)",
                num_qubits=64,
                status="requires_credentials",
                is_simulator=False
            ),
        ])
        
        return backends
    
    try:
        # Use IBM Quantum Runtime
        service = QiskitRuntimeService(channel="ibm_quantum")
        for backend in service.backends():
            backends.append(BackendInfo(
                name=backend.name,
                description=backend.configuration().description or "IBM Quantum backend",
                num_qubits=backend.configuration().num_qubits,
                status="available" if backend.status().operational else "unavailable",
                is_simulator=backend.configuration().simulator
            ))
    except Exception as e:
        print(f"Error getting IBM backends: {e}")
    
    return backends


def run_on_ibm_quantum(circuit_input: QuantumCircuitInput, backend_name: str = "ibmq_qsm_simulator") -> IBMRunResponse:
    """Run quantum circuit on IBM Quantum"""
    
    # Check if we have credentials
    api_token = os.environ.get("IBM_QUANTUM_API_TOKEN")
    
    if not api_token:
        # Return demo response
        return IBMRunResponse(
            success=False,
            status="demo",
            error="IBM Quantum API token not configured. Set IBM_QUANTUM_API_TOKEN in .env file to connect to real quantum computers."
        )
    
    if not QISKIT_AVAILABLE:
        return IBMRunResponse(
            success=False,
            status="error",
            error="Qiskit not available"
        )
    
    try:
        # Create circuit
        qc = create_circuit_from_gates(circuit_input.gates, circuit_input.num_qubits)
        
        if qc is None:
            return IBMRunResponse(
                success=False,
                status="error",
                error="Failed to create circuit"
            )
        
        # Initialize IBM Quantum service
        service = QiskitRuntimeService(channel="ibm_quantum")
        
        # Get backend
        backend = service.backend(backend_name)
        
        # Create transpiled circuit
        pm = generate_preset_pass_manager(optimization_level=1, backend=backend)
        transpiled_qc = pm.run(qc)
        
        # Run using Sampler
        start_time = datetime.now()
        sampler = Sampler(backend=backend)
        job = sampler.run([transpiled_qc])
        
        # Wait for results
        result = job.result()
        execution_time = (datetime.now() - start_time).total_seconds()
        
        # Extract probabilities
        quasi_dist = result[0].data.meas0
        probabilities = {k: round(v, 4) for k, v in quasi_dist.items()}
        
        return IBMRunResponse(
            success=True,
            job_id=job.job_id(),
            status="completed",
            result={
                "probabilities": probabilities,
                "quasi_distribution": dict(quasi_dist)
            },
            backend=backend_name,
            execution_time=execution_time
        )
        
    except Exception as e:
        return IBMRunResponse(
            success=False,
            status="error",
            error=str(e),
            backend=backend_name
        )


# ============================================================================
# EXPORT TO Q# (MICROSOFT QUANTUM)
# ============================================================================

def export_to_qsharp(circuit_input: QuantumCircuitInput) -> str:
    """Export quantum circuit to Q# (Microsoft Quantum)"""
    
    num_qubits = circuit_input.num_qubits
    
    # Generate Q# code
    qsharp_code = f"""// Quantara Quantum Circuit Export
// Generated: {datetime.now().isoformat()}
// Circuit: {circuit_input.gates}

// Microsoft Quantum Development Kit / Q#
namespace Quantara.Circuits {{
    
    open Microsoft.Quantum.Canon;
    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Math;
    open Microsoft.Quantum.Measurement;

    /// <summary>
    /// Quantum circuit with {num_qubits} qubit(s)
    /// </summary>
    operation RunCircuit() : Result[] {{
        // Allocate qubits
        use qubits = Qubit[{num_qubits}];
        
        // Initialize qubits to |0⟩
        ResetAll(qubits);
        
        // Apply quantum gates
"""
    
    # Add gates
    for i, gate in enumerate(circuit_input.gates):
        gate = gate.upper().strip()
        qubit_idx = i % num_qubits
        
        if gate == "H":
            qsharp_code += f"        H(qubits[{qubit_idx}]);  // Hadamard\n"
        elif gate == "X":
            qsharp_code += f"        X(qubits[{qubit_idx}]);  // Pauli-X (NOT)\n"
        elif gate == "Y":
            qsharp_code += f"        Y(qubits[{qubit_idx}]);  // Pauli-Y\n"
        elif gate == "Z":
            qsharp_code += f"        Z(qubits[{qubit_idx}]);  // Pauli-Z\n"
        elif gate == "S":
            qsharp_code += f"        S(qubits[{qubit_idx}]);  // Phase gate\n"
        elif gate == "T":
            qsharp_code += f"        T(qubits[{qubit_idx}]);  // T gate\n"
        elif gate in ["CX", "CNOT"]:
            if num_qubits >= 2:
                qsharp_code += f"        CNOT(qubits[0], qubits[1]);  // Controlled-X\n"
        elif gate == "CZ":
            if num_qubits >= 2:
                qsharp_code += f"        CZ(qubits[0], qubits[1]);  // Controlled-Z\n"
        elif gate == "SWAP":
            if num_qubits >= 2:
                qsharp_code += f"        SWAP(qubits[0], qubits[1]);  // SWAP\n"
    
    qsharp_code += """        
        // Measure all qubits
        let results = MultiM(qubits);
        
        // Reset qubits before release
        ResetAll(qubits);
        
        return results;
    }}
}
"""
    
    return qsharp_code


def export_to_qasm(circuit_input: QuantumCircuitInput) -> str:
    """Export quantum circuit to QASM"""
    
    qc = create_circuit_from_gates(circuit_input.gates, circuit_input.num_qubits)
    
    if qc is None:
        return "// Error: Could not create circuit"
    
    try:
        # Use qiskit.qasm2.dumps for Qiskit 2.x compatibility
        import qiskit.qasm2 as qasm2
        return qasm2.dumps(qc)
    except Exception as e:
        return f"// Error: Could not generate QASM: {str(e)}"


def export_to_qiskit(circuit_input: QuantumCircuitInput) -> str:
    """Export quantum circuit as Qiskit Python code"""
    
    code = f"""# Quantara Quantum Circuit Export
# Generated: {datetime.now().isoformat()}

from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit.transpiler import generate_preset_pass_manager

# Create {circuit_input.num_qubits}-qubit circuit
qc = QuantumCircuit({circuit_input.num_qubits}, {circuit_input.num_qubits})

# Add gates
"""
    
    for i, gate in enumerate(circuit_input.gates):
        gate = gate.upper().strip()
        qubit_idx = i % circuit_input.num_qubits
        
        code += f"qc.{gate.lower()}({qubit_idx})  # {gate}\n"
    
    code += """
# Add measurements
qc.measure_all()

# Run on simulator
simulator = AerSimulator()
result = simulator.run(qc, shots=1000).result()
counts = result.get_counts(qc)
print(counts)
"""
    
    return code


def export_circuit(request: ExportRequest) -> ExportResponse:
    """Export quantum circuit to various formats"""
    
    try:
        if request.format.lower() == "qsharp":
            code = export_to_qsharp(request.circuit)
        elif request.format.lower() == "qasm":
            code = export_to_qasm(request.circuit)
        elif request.format.lower() == "qiskit":
            code = export_to_qiskit(request.circuit)
        elif request.format.lower() == "braket":
            # Simplified Braket export
            code = f"""# Amazon Braket Circuit Export
from braket.circuits import Circuit

circuit = Circuit()
"""
            for i, gate in enumerate(request.circuit.gates):
                gate = gate.upper().strip()
                qubit_idx = i % request.circuit.num_qubits
                
                gate_map = {
                    "H": "h",
                    "X": "x",
                    "Y": "y",
                    "Z": "z",
                    "CX": "cnot",
                    "CNOT": "cnot"
                }
                
                if gate in gate_map:
                    code += f"circuit.{gate_map[gate]}({qubit_idx})\n"
                elif gate == "S":
                    code += f"circuit.phaseshift({qubit_idx}, 0.5)\n"
                elif gate == "T":
                    code += f"circuit.phaseshift({qubit_idx}, 0.25)\n"
            
            return ExportResponse(
                success=True,
                format="braket",
                code=code
            )
        else:
            return ExportResponse(
                success=False,
                format=request.format,
                error=f"Unknown format: {request.format}"
            )
        
        return ExportResponse(
            success=True,
            format=request.format,
            code=code
        )
        
    except Exception as e:
        return ExportResponse(
            success=False,
            format=request.format,
            error=str(e)
        )


# ============================================================================
# SHARE CIRCUITS
# ============================================================================

def generate_share_id() -> str:
    """Generate unique share ID"""
    # Create unique ID based on timestamp + random
    timestamp = datetime.now().isoformat()
    random_data = os.urandom(16)
    combined = f"{timestamp}{random_data.hex()}".encode()
    return base64.urlsafe_b64encode(hashlib.sha256(combined).digest()[:12]).decode()


def share_circuit(request: ShareRequest) -> ShareResponse:
    """Share a circuit and generate shareable link"""
    
    try:
        share_id = generate_share_id()
        
        # Store circuit (in production, use database)
        circuit_data = {
            "share_id": share_id,
            "name": request.name,
            "description": request.description,
            "circuit": {
                "gates": request.circuit.gates,
                "num_qubits": request.circuit.num_qubits,
                "shots": request.circuit.shots
            },
            "created_at": datetime.now().isoformat(),
            "expires_at": (datetime.now() + timedelta(days=30)).isoformat()
        }
        
        SHARED_CIRCUITS[share_id] = circuit_data
        
        # Generate share URL (would be full URL in production)
        share_url = f"/shared/{share_id}"
        
        return ShareResponse(
            success=True,
            share_id=share_id,
            share_url=share_url,
            expires_at=circuit_data["expires_at"]
        )
        
    except Exception as e:
        return ShareResponse(
            success=False,
            share_id="",
            share_url="",
            expires_at="",
            error=str(e)
        )


def load_shared_circuit(share_id: str) -> Optional[Dict[str, Any]]:
    """Load a shared circuit by ID"""
    
    circuit_data = SHARED_CIRCUITS.get(share_id)
    
    if circuit_data is None:
        return None
    
    # Check expiration
    expires_at = datetime.fromisoformat(circuit_data["expires_at"])
    if datetime.now() > expires_at:
        return None
    
    return circuit_data


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def get_integration_status() -> Dict[str, Any]:
    """Get status of all integrations"""
    
    return {
        "qiskit_available": QISKIT_AVAILABLE,
        "ibm_runtime_available": IBM_RUNTIME_AVAILABLE,
        "ibm_credentials_configured": bool(os.environ.get("IBM_QUANTUM_API_TOKEN")),
        "shared_circuits_count": len(SHARED_CIRCUITS),
        "features": {
            "local_simulation": QISKIT_AVAILABLE,
            "ibm_quantum_connection": IBM_RUNTIME_AVAILABLE and bool(os.environ.get("IBM_QUANTUM_API_TOKEN")),
            "qsharp_export": True,
            "qasm_export": QISKIT_AVAILABLE,
            "circuit_sharing": True,
            "braket_export": QISKIT_AVAILABLE
        }
    }