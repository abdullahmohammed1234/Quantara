import React from 'react'

/**
 * ErrorBoundary Component - Catches JavaScript errors in child components
 * Prevents full app crashes and provides fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleRetry,
        })
      }

      // Default fallback UI
      return (
        <div className="error-boundary-container p-6 bg-quantum-navy-light/50 border border-red-500/30 rounded-xl">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="font-orbitron text-lg text-red-400 font-semibold mb-2">
              {this.props.title || 'Something went wrong'}
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              {this.props.message || 'An unexpected error occurred'}
            </p>
            {this.props.showRetry !== false && (
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-quantum-cyan/20 border border-quantum-cyan/40 
                         rounded-lg text-quantum-cyan text-sm font-medium
                         hover:bg-quantum-cyan/30 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

/**
 * AsyncErrorBoundary - Specialized for async operations
 * Provides retry mechanism for failed requests
 */
export class AsyncErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('AsyncErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error })
  }

  handleRetry = async () => {
    const { retryCount } = this.state
    const maxRetries = this.props.maxRetries || 3
    
    if (retryCount >= maxRetries) {
      return
    }

    this.setState(prev => ({ 
      hasError: false, 
      error: null,
      retryCount: prev.retryCount + 1 
    }))

    // If there's a retry function, call it
    if (this.props.onRetry) {
      try {
        await this.props.onRetry()
      } catch (retryError) {
        this.setState({ 
          hasError: true, 
          error: retryError,
          retryCount: this.state.retryCount + 1 
        })
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const { retryCount } = this.state
      const maxRetries = this.props.maxRetries || 3
      const canRetry = retryCount < maxRetries

      return (
        <div className="async-error-container p-6 bg-quantum-navy-light/50 border border-amber-500/30 rounded-xl">
          <div className="text-center">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="font-orbitron text-lg text-amber-400 font-semibold mb-2">
              Request Failed
            </h3>
            <p className="text-sm text-slate-400 mb-2">
              {this.props.errorMessage || 'Failed to complete the request'}
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Attempt {retryCount} of {maxRetries}
            </p>
            {canRetry && (
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-amber-500/20 border border-amber-500/40 
                         rounded-lg text-amber-400 text-sm font-medium
                         hover:bg-amber-500/30 transition-colors"
              >
                Retry Request
              </button>
            )}
            {!canRetry && (
              <p className="text-xs text-red-400">
                Maximum retries reached. Please refresh the page.
              </p>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * useAsyncRetry Hook - Custom hook for retry functionality
 */
export const useAsyncRetry = (asyncFn, options = {}) => {
  const [state, setState] = React.useState({
    loading: false,
    error: null,
    data: null,
  })
  
  const retryCountRef = React.useRef(0)
  const maxRetries = options.maxRetries || 3
  const retryDelay = options.retryDelay || 1000

  const execute = async (...args) => {
    setState({ loading: true, error: null, data: null })
    
    try {
      const result = await asyncFn(...args)
      retryCountRef.current = 0
      setState({ loading: false, error: null, data: result })
      return result
    } catch (error) {
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1
        // Exponential backoff
        const delay = retryDelay * Math.pow(2, retryCountRef.current - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
        return execute(...args)
      }
      
      setState({ loading: false, error, data: null })
      throw error
    }
  }

  const reset = () => {
    retryCountRef.current = 0
    setState({ loading: false, error: null, data: null })
  }

  return {
    ...state,
    execute,
    reset,
    retryCount: retryCountRef.current,
  }
}