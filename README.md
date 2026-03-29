# Quantara - Quantum Computing Learning Platform

An AI-powered interactive quantum computing learning platform with 3D visualization, AI tutoring, gamified challenges, and a futuristic dark "Quantum OS" interface.

## Features

- **Quantum OS Boot Sequence**: Animated portal boot sequence with system initialization
- **Interactive Qubit Viewer**: 3D Bloch sphere visualization with real-time controls
- **Visual Circuit Builder**: Drag-and-drop quantum circuit editor
- **Gate Library**: Comprehensive library of quantum gates with visualizations
- **Algorithm Playground**: Interactive quantum algorithm demonstrations
- **Quantum Error Lab**: Explore quantum errors, decoherence, and noise effects
- **Quantum Lab Challenges**: Gamified learning with interactive challenges and XP system
- **AI Quantum Tutor**: Chat interface with code generation (Qiskit, Q#), contextual hints, and chat history
- **Onboarding Tutorial**: Step-by-step guided tour explaining quantum concepts
- **Global Search**: Ctrl+K search for gates, algorithms, and challenges
- **PWA Support**: Installable web app with offline capabilities
- **Accessibility**: Full accessibility support including keyboard navigation and ARIA labels

## Tech Stack

### Frontend
- React 18 with Vite
- Three.js / @react-three/fiber for 3D visualization
- React Router for navigation
- Framer Motion for animations
- Tailwind CSS for styling
- PWA with service workers
- KaTeX for math rendering
- React Markdown for rich text

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
2. Watch the Quantum OS boot sequence animation
3. Register or sign in to access the full platform
4. Navigate using the sidebar to explore different sections
5. Visit the **Qubits** page to interact with the Bloch sphere
6. Use the **AI Tutor** panel on the right to ask quantum computing questions
7. Complete challenges in **Quantum Lab** to earn XP
8. Press **Ctrl+K** to search across the platform
9. Visit the **Tutorial** page for a guided introduction

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

### AI Tutor
The AI Tutor panel provides:
- Context-aware responses based on current page
- Code generation for Qiskit and Q#
- Chat history with local storage persistence
- Voice input support (where available)

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
│   │   │   ├── ChallengePlayground.jsx
│   │   │   ├── CircuitBuilder.jsx
│   │   │   ├── GateLibrary.jsx
│   │   │   ├── GlobalSearchModal.jsx
│   │   │   ├── OnboardingTutorial.jsx
│   │   │   ├── ParticleField.jsx
│   │   │   ├── PortalBoot.jsx
│   │   │   ├── ProgressDashboard.jsx
│   │   │   ├── QubitViewer.jsx
│   │   │   ├── QuantumErrorPlayground.jsx
│   │   │   ├── TutorPanel.jsx
│   │   │   └── ...
│   │   ├── context/                   # React contexts
│   │   │   ├── AccessibilityContext.jsx
│   │   │   ├── AIMessageContext.jsx
│   │   │   ├── AuthContext.jsx
│   │   │   ├── GamificationContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── usePWA.jsx
│   │   │   ├── useKeyboardShortcuts.jsx
│   │   │   ├── usePinchToZoom.jsx
│   │   │   ├── useUnifiedAnimation.jsx
│   │   │   └── useWebSocket.js
│   │   ├── pages/                     # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── QubitsPage.jsx
│   │   │   ├── CircuitsPage.jsx
│   │   │   ├── AlgorithmsPage.jsx
│   │   │   ├── GateLibraryPage.jsx
│   │   │   ├── ChallengePage.jsx
│   │   │   ├── QuantumLab.jsx
│   │   │   ├── SharedCircuitPage.jsx
│   │   │   └── TutorialPage.jsx
│   │   ├── styles/                     # Global styles
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

## Navigation

The sidebar provides access to:
- **Dashboard** - Command center with system status
- **Qubits** - Interactive Bloch sphere visualization
- **Circuits** - Visual quantum circuit builder
- **Algorithms** - Algorithm playground
- **Gate Library** - Comprehensive gate reference
- **Error Lab** - Quantum error exploration
- **Quantum Lab** - Challenge-based learning
- **Tutorial** - Guided onboarding

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
