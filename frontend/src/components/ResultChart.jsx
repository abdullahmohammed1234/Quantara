import React from 'react'

/**
 * ResultChart Component
 * Displays quantum simulation results as a probability bar chart
 * Shows the probability distribution for |0⟩ and |1⟩ states
 */
const ResultChart = ({ result, noiseEnabled, noiseLevel }) => {
  // Extract probabilities
  const rawProbabilities = result?.probabilities || { '0': 0.5, '1': 0.5 }
  const rawP0 = rawProbabilities['0'] || 0
  const rawP1 = rawProbabilities['1'] || 0
  
  // Normalize probabilities to ensure they always sum to 100%
  const total = rawP0 + rawP1
  const p0 = total > 0 ? rawP0 / total : 0.5
  const p1 = total > 0 ? rawP1 / total : 0.5
  
  const circuit = result?.circuit || []
  const shots = result?.shots || 1000

  // Format probability as percentage
  const formatPercent = (val) => `${(val * 100).toFixed(1)}%`

  return (
    <div className="result-chart">
      {/* Circuit Summary */}
      <div className="result-circuit-summary">
        <span className="circuit-summary-label">Circuit:</span>
        <span className="circuit-summary-value">
          |0⟩ → {circuit.length > 0 ? circuit.join(' → ') : 'I'} → Measure
        </span>
      </div>

      {/* Bar Chart */}
      <div className="probability-chart">
        {/* |0⟩ Bar */}
        <div className="probability-row">
          <div className="probability-label">
            <span className="ket-symbol">|0⟩</span>
            <span className="probability-value">{formatPercent(p0)}</span>
          </div>
          <div className="probability-bar-container">
            <div 
              className="probability-bar probability-bar-0"
              style={{ width: `${p0 * 100}%` }}
            >
              <div className="probability-bar-glow"></div>
            </div>
          </div>
        </div>

        {/* |1⟩ Bar */}
        <div className="probability-row">
          <div className="probability-label">
            <span className="ket-symbol">|1⟩</span>
            <span className="probability-value">{formatPercent(p1)}</span>
          </div>
          <div className="probability-bar-container">
            <div 
              className="probability-bar probability-bar-1"
              style={{ width: `${p1 * 100}%` }}
            >
              <div className="probability-bar-glow"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with shots and noise info */}
      <div className="result-footer">
        <span className="result-shots">{shots} shots</span>
        {noiseEnabled && (
          <span className="result-noise-badge">
            ⚡ Noise: {(noiseLevel * 100).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  )
}

export default ResultChart
