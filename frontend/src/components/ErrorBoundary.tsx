import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType<{
    error: Error;
    resetError: () => void;
  }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Send error to logging service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // logErrorToService(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackComponent) {
        const FallbackComponent = this.props.fallbackComponent;
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={this.resetError}
          />
        );
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Κάτι πήγε στραβά
            </h2>
            
            <p className="text-gray-600 text-center mb-4">
              Λυπούμαστε για την αναστάτωση. Παρακαλώ δοκιμάστε να ανανεώσετε τη σελίδα.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.resetError}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Δοκιμάστε ξανά
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Ανανέωση σελίδας
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-3 bg-red-50 rounded-lg">
                <summary className="cursor-pointer text-sm font-medium text-red-700">
                  Λεπτομέρειες σφάλματος (Dev Mode)
                </summary>
                <pre className="mt-2 text-xs text-red-600 overflow-auto">
                  {this.state.error.stack}
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

// Higher-order component for functional components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallbackComponent?: React.ComponentType<{
    error: Error;
    resetError: () => void;
  }>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallbackComponent={fallbackComponent}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default ErrorBoundary;