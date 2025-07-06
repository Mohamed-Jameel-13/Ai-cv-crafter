import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-amber-900 mb-4">Oops! Something went wrong</h1>
            <p className="text-amber-800/80 mb-6">
              We encountered an unexpected error. Please refresh the page to try again.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Refresh Page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full border-2 border-amber-300 text-amber-800 hover:bg-amber-50 py-3 px-6 rounded-xl font-medium transition-all duration-200"
              >
                Go to Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-amber-700 hover:text-amber-900">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs bg-amber-50 p-3 rounded border text-red-600 overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 