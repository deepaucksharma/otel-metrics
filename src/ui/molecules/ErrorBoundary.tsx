/**
 * Error boundary component to catch and gracefully handle errors in the UI.
 *
 * @purpose Prevent application crashes by intercepting errors in React components.
 * @algorithm
 * 1. Catch JavaScript errors in child component trees
 * 2. Display a user-friendly error message with details
 * 3. Provide options to retry, reset, or show error details
 * 4. Log errors to the console for debugging
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

export interface ErrorBoundaryProps {
  /** The component(s) to be wrapped by the error boundary */
  children: ReactNode;
  /** Optional fallback component to display when an error occurs */
  fallback?: ReactNode;
  /** Custom handler function to be called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Optional reset function that will be called when the user clicks "Retry" */
  onReset?: () => void;
  /** Optional component name for better error messages */
  componentName?: string;
}

export interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The error that was caught */
  error: Error | null;
  /** Additional information about the error stack trace */
  errorInfo: ErrorInfo | null;
  /** Whether to show the error stack trace */
  showDetails: boolean;
}

/**
 * Component that catches JavaScript errors in its child component tree.
 * Displays a user-friendly error UI instead of crashing the app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Capture error info for display
    this.setState({
      errorInfo
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    
    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };
  
  toggleDetails = (): void => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { children, fallback, componentName } = this.props;
    
    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return fallback;
      }
      
      // Otherwise, use the default error UI
      return (
        <div className={styles.container} role="alert" aria-live="assertive">
          <div className={styles.header}>
            <h3 className={styles.title}>
              {componentName ? `Error in ${componentName}` : 'Something went wrong'}
            </h3>
          </div>
          
          <div className={styles.message}>
            {error?.message || 'An unexpected error occurred'}
          </div>
          
          <div className={styles.buttons}>
            <button 
              className={`${styles.button} ${styles.primary}`} 
              onClick={this.handleReset}
            >
              Try again
            </button>
          </div>
          
          <div className={styles.details}>
            <button 
              className={styles.detailsButton}
              onClick={this.toggleDetails}
              aria-expanded={showDetails}
            >
              {showDetails ? 'Hide technical details' : 'Show technical details'}
            </button>
            
            {showDetails && errorInfo && (
              <pre className={styles.stack}>
                {error?.stack}\n\nComponent Stack:\n{errorInfo.componentStack}
              </pre>
            )}
          </div>
        </div>
      );
    }

    // If there's no error, render children normally
    return <div className={styles.childrenContainer}>{children}</div>;
  }
}

export default ErrorBoundary;