# Quantara - Quantum Computing Learning Platform

An AI-powered interactive quantum computing learning platform with 3D visualization, AI tutoring, gamification, and a futuristic dark UI.

## Features

- **Interactive Qubit Viewer**: 3D Bloch sphere visualization with real-time controls
- **Visual Circuit Builder**: Drag-and-drop quantum circuit editor
- **Gate Library**: Comprehensive library of quantum gates with visualizations
- **Algorithm Playground**: Interactive quantum algorithm demonstrations
- **Quantum Error Playground**: Explore quantum errors and decoherence
- **AI Quantum Tutor**: Chat interface powered by RAG for quantum computing questions
- **Progress Tracking**: Gamified learning with challenges and achievements
- **PWA Support**: Installable web app with offline capabilities
- **Accessibility**: Full accessibility support including keyboard navigation
- **Interactive Tutorial System**: Step-by-step onboarding with quantum concept explanations
- **Contextual Help**: Tooltips and help panels for circuit builder and gates

## Tech Stack

### Frontend
- React 18 with Vite
- Three.js / @react-three/fiber for 3D visualization
- React Router for navigation
- Framer Motion for animations
- Tailwind CSS for styling
- PWA with service workers

### Backend
- FastAPI (Python)
- LangChain for RAG pipeline
- FAISS for vector storage
- SQLite for data persistence
- WebSocket for real-time communication
- JWT authentication

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- pip

### Installation

1. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start the Backend**
   ```bash
   cd backend
   python -m uvicorn server:app --host 0.0.0.0 --port 8000
   ```
   The API will run at `http://localhost:8000`

2. **Start the Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

### Usage

1. Open `http://localhost:5173` in your browser
2. Navigate using the sidebar to explore different sections
3. Visit the **Qubits** page to interact with the Bloch sphere
4. Use the **AI Tutor** panel on the right to ask quantum computing questions
5. Track your progress on the **Progress** page
6. Click the **Help button** (❓) in the bottom-right corner to start the interactive tutorial
7. Hover over quantum concepts (gates, states, etc.) to see detailed tooltips

## Learning Resources

### Interactive Tutorial
The onboarding tutorial covers these key concepts:
- **Qubits**: Understanding quantum bits and superposition
- **Hadamard Gate**: Creating superposition states
- **Circuit Builder**: Building your first quantum circuit
- **Measurement**: Observing quantum states
- **Entanglement**: Quantum correlations between qubits
- **Bloch Sphere**: Geometric representation of quantum states

### Quantum Concepts Reference
Hover over elements in the circuit builder to see tooltip explanations for:
- Gate operations and their matrix representations
- Quantum state notation (|ψ⟩, |0⟩, |1⟩)
- Probability amplitudes and measurement outcomes
- Entanglement patterns

### Help Contexts
The contextual help panel (bottom-left) provides context-aware information for:
- **General**: Getting started with quantum computing
- **Circuit**: Circuit builder operations
- **Gates**: Detailed gate explanations
- **Measurement**: Understanding measurement and results
- **Simulation**: How quantum simulation works

## Project Structure

```
Quantara/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3D/                    # 3D visualization components
│   │   │   │   ├── Circuit3D.jsx
│   │   │   │   ├── HolographicUI.jsx
│   │   │   │   ├── ParticleSystems.jsx
│   │   │   │   └── QuantumGames.jsx
│   │   │   ├── ui/                    # Reusable UI components
│   │   │   │   ├── AuthButton.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── HoloComponents.jsx
│   │   │   │   └── ...
│   │   │   ├── AlgorithmPlayground.jsx
│   │   │   ├── CircuitBuilder.jsx
│   │   │   ├── GateLibrary.jsx
│   │   │   ├── OnboardingTutorial.jsx      # Tutorial system & tooltips
│   │   │   ├── ParticleField.jsx
│   │   │   ├── ProgressDashboard.jsx
│   │   │   ├── QubitViewer.jsx
│   │   │   ├── QuantumErrorPlayground.jsx
│   │   │   ├── TutorPanel.jsx
│   │   │   └── ...
│   │   ├── context/                   # React contexts
│   │   │   ├── AccessibilityContext.jsx
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── ...
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── usePWA.jsx
│   │   │   ├── useKeyboardShortcuts.jsx
│   │   │   └── ...
│   │   ├── pages/                     # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── QubitsPage.jsx
│   │   │   ├── CircuitsPage.jsx
│   │   │   ├── AlgorithmsPage.jsx
│   │   │   ├── GateLibraryPage.jsx
│   │   │   ├── ChallengePage.jsx
│   │   │   └── QuantumLab.jsx
│   │   ├── styles/                     # Global styles
│   │   ├── lib/                        # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── backend/
    ├── server.py                    # Main FastAPI application
    ├── main.py                      # API routes
    ├── auth.py                      # Authentication
    ├── database.py                  # SQLite database
    ├── ingest.py                    # RAG data ingestion
    ├── query.py                     # RAG query handling
    ├── websocket.py                 # WebSocket handlers
    ├── quantum_integration.py       # Quantum computing integration
    ├── requirements.txt             # Python dependencies
    ├── .env.example                 # Environment template
    └── data/                        # Vector store data
```

## API Endpoints

### Core Endpoints
- `GET /` - API info
- `GET /health` - Health check

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Quantum Q&A
- `POST /api/ask` - Ask a quantum computing question
- `POST /api/ingest` - Ingest documents into vector store

### User Progress
- `GET /api/progress` - Get user progress
- `POST /api/progress` - Update progress

### WebSocket
- `WS /ws` - Real-time communication

## Environment Variables

Create a `.env` file in the backend directory:

```bash
# Backend
JWT_SECRET=your-secret-key
DATABASE_URL=quantara.db

# Optional: OpenAI (for advanced RAG)
OPENAI_API_KEY=your-api-key
```

## License

MIT
