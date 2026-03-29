import React from 'react'
import AlgorithmPlayground from '../components/AlgorithmPlayground'

/**
 * AlgorithmsPage Component
 * Page wrapper for the Algorithm Playground feature
 */
const AlgorithmsPage = () => {
  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">Quantum Algorithms</h1>
        <p className="page-subtitle">
          Explore and understand key quantum algorithms through interactive visualizations
        </p>
      </div>
      
      <AlgorithmPlayground />
    </div>
  )
}

export default AlgorithmsPage