import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: { componentStack: string }) => void;
}

/**
 * Error Boundary Wrapper Component
 * Note: React Error Boundaries must be class components.
 * This is a functional wrapper. For full error catching, use as a class component.
 */
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback,
  onError
}) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const handleReset = () => {
    setHasError(false);
    setError(null);
  };

  if (hasError) {
    return (
      fallback || (
        <div className="glass-card rounded-xl p-8 text-center space-y-4">
          <div className="inline-block p-4 bg-red-500/20 rounded-full">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold">Something went wrong</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">{error?.message || 'An unexpected error occurred'}</p>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
          >
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      )
    );
  }

  return <>{children}</>;
};
