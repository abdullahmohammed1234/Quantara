"""
Quantara Server - FastAPI Backend with Gemini RAG
================================================

This module provides the REST API for the quantum computing tutor.
It uses the modular RAG pipeline built with:
- FAISS for vector storage
- Sentence-transformers for embeddings
- Google Gemini API for generation

Author: Quantara AI Team
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Import our RAG components
from query import QuantumRAG, create_rag_system, TOP_K
import ingest

# Import auth module
import auth

# Import quantum integration services
from quantum_integration import (
    get_integration_status,
    get_ibm_backends,
    run_on_ibm_quantum,
    run_circuit_local,
    export_circuit,
    share_circuit,
    load_shared_circuit,
    QuantumCircuitInput,
    IBMRunRequest,
    ExportRequest,
    ShareRequest,
    BackendInfo
)

# Import auth module
import auth

# Import database functions
import database

# Import WebSocket module
import websocket as ws_module

# Try importing qiskit_ibm_runtime for real IBM Quantum


# ============================================================================
# LIFESPAN CONTEXT MANAGER
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    print("\n" + "="*60)
    print("QUANTARA SERVER - STARTUP")
    print("="*60)
    
    # Check for API key
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("\n⚠️  WARNING: GEMINI_API_KEY not set!")
        print("   Set it with: export GEMINI_API_KEY='your-key'")
        print("   Or create a .env file with GEMINI_API_KEY=your-key")
    else:
        print("✓ Gemini API key configured")
    
    # Initialize RAG system
    print("\nInitializing RAG system...")
    global rag_system
    rag_system = create_rag_system()
    
    if rag_system and rag_system.index:
        print(f"✓ Knowledge base loaded ({len(rag_system.chunks)} chunks)")
    else:
        print("⚠️  Knowledge base not loaded")
        print("   Call POST /ingest to build the index")
    
    print("\n✓ Quantara API ready!")
    print("="*60 + "\n")
    
    yield
    
    # Shutdown
    print("\nShutting down Quantara server...")


# ============================================================================
# FASTAPI APP SETUP
# ============================================================================

app = FastAPI(
    title="Quantara API",
    version="2.0.0",
    description="AI-powered quantum computing tutor using Google Gemini + RAG",
    lifespan=lifespan
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",      # Vite dev server
        "http://127.0.0.1:5173",     # Alternative localhost
        "http://localhost:3000",      # React dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth router
app.include_router(auth.router)


# ============================================================================
# QUANTUM SIMULATION IMPORTS
# ============================================================================

try:
    from qiskit import QuantumCircuit
    from qiskit_aer import AerSimulator
    from qiskit.circuit import Reset
    QISKIT_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Qiskit not available: {e}")
    QISKIT_AVAILABLE = False
    QuantumCircuit = None
    AerSimulator = None


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class SimulateRequest(BaseModel):
    """Request model for /simulate endpoint"""
    circuit: List[str]  # List of gate names e.g., ["H", "X"]
    noise_enabled: bool = False  # Enable noise simulation
    noise_level: float = 0.0  # Noise level 0-1


class SimulateResponse(BaseModel):
    """Response model for /simulate endpoint"""
    circuit: List[str]
    probabilities: dict  # {"0": 0.5, "1": 0.5}
    noise_enabled: bool
    noise_level: float
    shots: int
    error: Optional[str] = None


class AskRequest(BaseModel):
    """Request model for /ask endpoint"""
    question: str
    top_k: Optional[int] = TOP_K  # Optional: override default retrieval count


class AskResponse(BaseModel):
    """Response model for /ask endpoint"""
    answer: str
    sources: List[str]
    num_sources: Optional[int] = None
    retrieval_scores: Optional[List[float]] = None
    error: Optional[str] = None


class IngestRequest(BaseModel):
    """Request model for /ingest endpoint"""
    force_rebuild: Optional[bool] = False


class IngestResponse(BaseModel):
    """Response model for /ingest endpoint"""
    success: bool
    message: str
    num_chunks: Optional[int] = None


# ============================================================================
# GLOBAL RAG INSTANCE
# ============================================================================

# Global RAG system instance (lazy-loaded)
rag_system: Optional[QuantumRAG] = None


def get_rag_system() -> QuantumRAG:
    """
    Get or initialize the RAG system.
    
    Returns:
        QuantumRAG instance
    """
    global rag_system
    
    if rag_system is None:
        print("Initializing RAG system...")
        rag_system = create_rag_system()
    
    return rag_system


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """
    Root endpoint - API information
    """
    api_key_set = bool(os.environ.get("GEMINI_API_KEY"))
    
    return {
        "name": "Quantara API",
        "version": "2.0.0",
        "status": "running",
        "description": "AI-powered quantum computing tutor with Gemini RAG",
        "features": {
            "rag_enabled": True,
            "llm": "Google Gemini 1.5 Flash",
            "embeddings": "sentence-transformers/all-MiniLM-L6-v2",
            "vector_store": "FAISS",
            "api_key_configured": api_key_set
        },
        "endpoints": {
            "POST /ask": "Ask a quantum computing question",
            "POST /ingest": "Rebuild the knowledge base index",
            "GET /health": "Health check",
            "GET /status": "System status"
        }
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    global rag_system
    
    index_loaded = rag_system is not None and rag_system.index is not None
    api_key_set = bool(os.environ.get("GEMINI_API_KEY"))
    
    return {
        "status": "healthy" if index_loaded else "degraded",
        "index_loaded": index_loaded,
        "gemini_configured": api_key_set,
        "rag_available": rag_system is not None
    }


@app.get("/status")
async def system_status():
    """
    Detailed system status
    """
    global rag_system
    
    api_key_set = bool(os.environ.get("GEMINI_API_KEY"))
    
    status = {
        "api": {
            "version": "2.0.0",
            "gemini_configured": api_key_set
        },
        "rag": {
            "available": rag_system is not None,
            "index_loaded": False,
            "num_chunks": 0
        }
    }
    
    if rag_system is not None and rag_system.index is not None:
        status["rag"]["index_loaded"] = True
        status["rag"]["num_chunks"] = len(rag_system.chunks) if rag_system.chunks else 0
    
    return status


# ============================================================================
# QUANTUM SIMULATION ENDPOINT
# ============================================================================

@app.post("/simulate", response_model=SimulateResponse)
async def simulate_circuit(request: SimulateRequest):
    """
    Simulate a 1-qubit quantum circuit using Qiskit.
    
    Parameters:
        circuit: List of gate names ["H", "X", "Z", "S", "T"]
        noise_enabled: Enable noise simulation
        noise_level: Noise level from 0 to 1
    
    Returns:
        Probability distribution for |0⟩ and |1⟩ states
    """
    if not QISKIT_AVAILABLE:
        # Fallback simulation without Qiskit
        print("Warning: Using fallback simulation (Qiskit not available)")
        return simulate_fallback(
            request.circuit, 
            request.noise_enabled, 
            request.noise_level
        )
    
    try:
        # Create 1-qubit quantum circuit
        qc = QuantumCircuit(1, 1)
        
        # Apply gates in order
        for gate in request.circuit:
            gate = gate.upper().strip()
            if gate == "H":
                qc.h(0)  # Hadamard gate
            elif gate == "X":
                qc.x(0)  # Pauli-X gate (NOT)
            elif gate == "Z":
                qc.z(0)  # Pauli-Z gate
            elif gate == "S":
                qc.s(0)  # Phase gate
            elif gate == "T":
                qc.t(0)  # T gate
            elif gate == "Y":
                qc.y(0)  # Pauli-Y gate
            else:
                print(f"Unknown gate: {gate}, skipping")
        
        # Measure the qubit
        qc.measure(0, 0)
        
        # Use AerSimulator
        simulator = AerSimulator()
        
        # Number of shots for simulation
        shots = 1000
        
        # Run simulation
        if request.noise_enabled and request.noise_level > 0:
            # Create noise model based on noise level
            from qiskit_aer.noise import NoiseModel, depolarizing_error
            
            # Depolarizing error probability scales with noise_level
            error_prob = request.noise_level * 0.5  # Scale to reasonable range
            
            # Create depolarizing error for single-qubit gates
            error = depolarizing_error(error_prob, 1)
            
            # Build noise model
            noise_model = NoiseModel()
            noise_model.add_all_qubit_quantum_error(error, ["h", "x", "z", "s", "t", "y"])
            
            # Run with noise
            job = simulator.run(qc, shots=shots, noise_model=noise_model)
        else:
            # Ideal simulation (no noise)
            job = simulator.run(qc, shots=shots)
        
        # Get results
        result = job.result()
        counts = result.get_counts(qc)
        
        # Calculate probabilities
        total_shots = sum(counts.values())
        probabilities = {
            "0": round(counts.get("0", 0) / total_shots, 4),
            "1": round(counts.get("1", 0) / total_shots, 4)
        }
        
        print(f"Simulation complete: circuit={request.circuit}, probs={probabilities}")
        
        return SimulateResponse(
            circuit=request.circuit,
            probabilities=probabilities,
            noise_enabled=request.noise_enabled,
            noise_level=request.noise_level,
            shots=shots
        )
        
    except Exception as e:
        print(f"Error in simulation: {e}")
        # Fallback on error
        return simulate_fallback(
            request.circuit,
            request.noise_enabled,
            request.noise_level,
            error=str(e)
        )


def simulate_fallback(circuit: List[str], noise_enabled: bool = False, 
                       noise_level: float = 0.0, error: str = None) -> SimulateResponse:
    """
    Fallback simulation when Qiskit is not available.
    Uses analytical quantum mechanics calculations.
    """
    import math
    
    # Default: start in |0⟩ state
    # State vector: [alpha, beta] where |0⟩ = alpha*|0⟩ + beta*|1⟩
    # Initial state |0⟩ = [1, 0]
    alpha = 1.0 + 0.0j
    beta = 0.0 + 0.0j
    
    # Apply each gate
    for gate in circuit:
        gate = gate.upper().strip()
        if gate == "H":
            # Hadamard: |0⟩ → (|0⟩+|1⟩)/√2, |1⟩ → (|0⟩-|1⟩)/√2
            new_alpha = (alpha + beta) / math.sqrt(2)
            new_beta = (alpha - beta) / math.sqrt(2)
            alpha, beta = new_alpha, new_beta
        elif gate == "X":
            # Pauli-X: |0⟩ → |1⟩, |1⟩ → |0⟩
            alpha, beta = beta, alpha
        elif gate == "Z":
            # Pauli-Z: |0⟩ → |0⟩, |1⟩ → -|1⟩
            beta = -beta
        elif gate == "Y":
            # Pauli-Y: |0⟩ → i|1⟩, |1⟩ → -i|0⟩
            alpha, beta = 1j * beta, -1j * alpha
        elif gate == "S":
            # Phase gate: |0⟩ → |0⟩, |1⟩ → i|1⟩
            beta = 1j * beta
        elif gate == "T":
            # T gate: |0⟩ → |0⟩, |1⟩ → e^(iπ/4)|1⟩
            beta = (math.cos(math.pi/4) + 1j * math.sin(math.pi/4)) * beta
    
    # Calculate probabilities (magnitude squared)
    p0 = abs(alpha) ** 2
    p1 = abs(beta) ** 2
    
    # Normalize if needed
    total = p0 + p1
    if total > 0:
        p0, p1 = p0/total, p1/total
    
    # Apply noise if enabled
    if noise_enabled and noise_level > 0:
        # Simple depolarizing noise model
        # Mix with maximally mixed state based on noise level
        noise_factor = noise_level
        p0 = p0 * (1 - noise_factor) + 0.5 * noise_factor
        p1 = p1 * (1 - noise_factor) + 0.5 * noise_factor
    
    return SimulateResponse(
        circuit=circuit,
        probabilities={"0": round(p0, 4), "1": round(p1, 4)},
        noise_enabled=noise_enabled,
        noise_level=noise_level,
        shots=1000,
        error=error
    )


@app.post("/ingest", response_model=IngestResponse)
async def rebuild_index(request: IngestRequest = IngestRequest()):
    """
    Rebuild the knowledge base index.
    
    This processes the quantum_docs.txt file and creates embeddings.
    Use force_rebuild=True to rebuild even if index exists.
    """
    try:
        print(f"Rebuilding index (force={request.force_rebuild})...")
        
        success = ingest.build_index(force_rebuild=request.force_rebuild)
        
        if success:
            # Reload the RAG system with new index
            global rag_system
            rag_system = create_rag_system()
            
            num_chunks = len(rag_system.chunks) if rag_system and rag_system.chunks else 0
            
            return IngestResponse(
                success=True,
                message="Index rebuilt successfully",
                num_chunks=num_chunks
            )
        else:
            return IngestResponse(
                success=False,
                message="Failed to rebuild index"
            )
            
    except Exception as e:
        print(f"Error rebuilding index: {e}")
        return IngestResponse(
            success=False,
            message=f"Error: {str(e)}"
        )


@app.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest):
    """
    Ask a quantum computing question.
    
    This endpoint:
    1. Retrieves relevant context from the knowledge base
    2. Sends context + question to Gemini
    3. Returns grounded, beginner-friendly answer
    
    The response is always based on retrieved context to avoid hallucinations.
    """
    # Validate question
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    # Get RAG system
    rag = get_rag_system()
    
    if rag is None:
        raise HTTPException(
            status_code=503, 
            detail="RAG system not initialized. Please try /ingest endpoint first."
        )
    
    if rag.index is None:
        raise HTTPException(
            status_code=503,
            detail="Knowledge base not loaded. Call /ingest endpoint first."
        )
    
    try:
        # Execute RAG pipeline
        result = rag.query(request.question, top_k=request.top_k)
        
        # Return response
        return AskResponse(
            answer=result.get("answer", "No answer generated"),
            sources=result.get("sources", []),
            num_sources=result.get("num_sources"),
            retrieval_scores=result.get("retrieval_scores"),
            error=result.get("error")
        )
        
    except Exception as e:
        print(f"Error processing question: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing question: {str(e)}"
        )


# ============================================================================
# QUANTUM INTEGRATION ENDPOINTS
# ============================================================================

@app.get("/integration/status")
async def integration_status():
    """
    Get status of all quantum integrations.
    """
    return get_integration_status()


@app.get("/integration/backends")
async def list_ibm_backends():
    """
    Get list of available IBM Quantum backends.
    """
    backends = get_ibm_backends()
    return {"backends": [b.model_dump() for b in backends]}


class RunLocalRequest(BaseModel):
    """Request to run circuit locally"""
    gates: List[str]
    num_qubits: int = 1
    shots: int = 1000


class RunLocalResponse(BaseModel):
    """Response from local circuit run"""
    success: bool
    counts: Optional[Dict[str, int]] = None
    probabilities: Optional[Dict[str, float]] = None
    shots: int
    circuit_depth: Optional[int] = None
    num_qubits: int
    error: Optional[str] = None


@app.post("/integration/run/local", response_model=RunLocalResponse)
async def run_local_circuit(request: RunLocalRequest):
    """
    Run quantum circuit on local simulator.
    """
    circuit_input = QuantumCircuitInput(
        gates=request.gates,
        num_qubits=request.num_qubits,
        shots=request.shots
    )
    
    result = run_circuit_local(circuit_input)
    
    return RunLocalResponse(
        success=result.get("success", False),
        counts=result.get("counts"),
        probabilities=result.get("probabilities"),
        shots=request.shots,
        circuit_depth=result.get("circuit_depth"),
        num_qubits=request.num_qubits,
        error=result.get("error")
    )


class IBMRunRequest(BaseModel):
    """Request to run on IBM Quantum"""
    gates: List[str]
    num_qubits: int = 1
    shots: int = 1000
    backend_name: str = "ibmq_qasm_simulator"


@app.post("/integration/run/ibm")
async def run_ibm_circuit(request: IBMRunRequest):
    """
    Run quantum circuit on IBM Quantum hardware or simulator.
    Requires IBM_QUANTUM_API_TOKEN in .env file.
    """
    circuit_input = QuantumCircuitInput(
        gates=request.gates,
        num_qubits=request.num_qubits,
        shots=request.shots
    )
    
    return run_on_ibm_quantum(circuit_input, request.backend_name)


class ExportRequest(BaseModel):
    """Request to export circuit"""
    gates: List[str]
    num_qubits: int = 1
    shots: int = 1000
    format: str  # qsharp, qasm, qiskit, braket


@app.post("/integration/export")
async def export_circuit_endpoint(request: ExportRequest):
    """
    Export quantum circuit to various formats (Q#, QASM, Qiskit, Braket).
    """
    # Use the export_circuit function from quantum_integration
    from quantum_integration import ExportRequest as QuantumExportRequest, export_circuit
    
    circuit_input = QuantumCircuitInput(
        gates=request.gates,
        num_qubits=request.num_qubits,
        shots=request.shots
    )
    
    export_req = QuantumExportRequest(
        circuit=circuit_input,
        format=request.format
    )
    
    return export_circuit(export_req)


class ShareRequest(BaseModel):
    """Request to share circuit"""
    gates: List[str]
    num_qubits: int = 1
    shots: int = 1000
    name: str = "Untitled Circuit"
    description: str = ""


@app.post("/integration/share")
async def share_circuit_endpoint(request: ShareRequest):
    """
    Share a quantum circuit and get a shareable link.
    """
    # Use the share_circuit function from quantum_integration
    from quantum_integration import ShareRequest as QuantumShareRequest, share_circuit
    
    circuit_input = QuantumCircuitInput(
        gates=request.gates,
        num_qubits=request.num_qubits,
        shots=request.shots
    )
    
    share_req = QuantumShareRequest(
        circuit=circuit_input,
        name=request.name,
        description=request.description
    )
    
    return share_circuit(share_req)


@app.get("/integration/shared/{share_id}")
async def load_shared_circuit_endpoint(share_id: str):
    """
    Load a shared circuit by ID.
    """
    circuit_data = load_shared_circuit(share_id)
    
    if circuit_data is None:
        raise HTTPException(
            status_code=404,
            detail="Shared circuit not found or expired"
        )
    
    return circuit_data


# ============================================================================
# DATA PERSISTENCE ENDPOINTS
# ============================================================================

class SaveProgressRequest(BaseModel):
    """Request to save user progress"""
    user_id: int
    challenge_id: str
    completed: bool = False
    points_earned: int = 0
    best_circuit: Optional[List[str]] = None


@app.post("/progress/save")
async def save_progress(request: SaveProgressRequest):
    """
    Save user progress for a challenge.
    """
    import json
    
    best_circuit_json = None
    if request.best_circuit:
        best_circuit_json = json.dumps(request.best_circuit)
    
    result = database.save_user_progress(
        request.user_id,
        request.challenge_id,
        request.completed,
        request.points_earned,
        best_circuit_json
    )
    
    return result


class GetProgressRequest(BaseModel):
    """Request to get user progress"""
    user_id: int


@app.post("/progress/get")
async def get_progress(request: GetProgressRequest):
    """
    Get all progress for a user.
    """
    result = database.get_user_progress(request.user_id)
    return result


class SaveCircuitRequest(BaseModel):
    """Request to save circuit design"""
    user_id: int
    name: str
    gates: List[str]
    description: str = ""
    num_qubits: int = 1
    is_public: bool = False
    design_id: Optional[int] = None


@app.post("/circuit/save")
async def save_circuit(request: SaveCircuitRequest):
    """
    Save a circuit design.
    """
    result = database.save_circuit_design(
        request.user_id,
        request.name,
        request.gates,
        request.description,
        request.num_qubits,
        request.is_public,
        request.design_id
    )
    
    return result


class GetCircuitRequest(BaseModel):
    """Request to get circuit designs"""
    user_id: int
    design_id: Optional[int] = None


@app.post("/circuit/get")
async def get_circuit(request: GetCircuitRequest):
    """
    Get circuit designs for a user.
    """
    if request.design_id:
        result = database.get_circuit_design(request.design_id, request.user_id)
    else:
        result = database.get_user_circuit_designs(request.user_id)
    
    return result


class DeleteCircuitRequest(BaseModel):
    """Request to delete circuit design"""
    user_id: int
    design_id: int


@app.post("/circuit/delete")
async def delete_circuit(request: DeleteCircuitRequest):
    """
    Delete a circuit design.
    """
    result = database.delete_circuit_design(request.design_id, request.user_id)
    return result


class SettingsRequest(BaseModel):
    """Request to get/update settings"""
    user_id: int
    settings: Optional[Dict] = None


@app.post("/settings/get")
async def get_settings(request: SettingsRequest):
    """
    Get user settings.
    """
    result = database.get_user_settings(request.user_id)
    return result


@app.post("/settings/update")
async def update_settings(request: SettingsRequest):
    """
    Update user settings.
    """
    if not request.settings:
        raise HTTPException(status_code=400, detail="Settings not provided")
    
    result = database.update_user_settings(request.user_id, request.settings)
    return result


# ============================================================================
# WEBSOCKET ENDPOINTS
# ============================================================================


@app.websocket("/ws/simulation")
async def simulation_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for real-time quantum simulation.
    
    Clients connect to receive simulation progress updates
    and collaborate on circuit building.
    """
    await ws_module.handle_simulation_websocket(websocket)


@app.websocket("/ws/simulation/{room}")
async def simulation_websocket_room(websocket: WebSocket, room: str):
    """
    WebSocket endpoint for room-based simulation.
    
    Clients join a specific room for collaborative circuit building.
    """
    await ws_module.handle_simulation_websocket(websocket, room)


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    # Run the server on port 8001 to avoid conflicts
    uvicorn.run(
        "server:app",  # Use import string for reload
        host="0.0.0.0",
        port=8001,
        reload=True
    )
