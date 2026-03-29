import React from 'react'
import GateLibrary from '../components/GateLibrary'

/**
 * GateLibraryPage Component
 * Page wrapper for the Gate Library feature
 */
const GateLibraryPage = () => {
  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">Gate Library</h1>
        <p className="page-subtitle">
          Comprehensive reference of quantum gates with detailed explanations
        </p>
      </div>
      
      <GateLibrary />
    </div>
  )
}

export default GateLibraryPage