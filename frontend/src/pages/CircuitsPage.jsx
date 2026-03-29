import React from 'react';
import CircuitBuilder from '../components/CircuitBuilder';

const CircuitsPage = () => {
  return (
    <div style={{
      flex: 1,
      padding: '32px',
      overflow: 'auto',
      position: 'relative',
      zIndex: 1
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 600,
          color: '#fff',
          marginBottom: '8px'
        }}>
          Quantum Circuits
        </h1>
        <p style={{ color: '#8a8a9a', fontSize: '16px' }}>
          Build and simulate quantum circuits with various gates
        </p>
      </div>

      <CircuitBuilder />
    </div>
  );
};

export default CircuitsPage;
