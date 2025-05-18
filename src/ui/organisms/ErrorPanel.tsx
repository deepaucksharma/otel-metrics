/**
 * Panel displaying all error messages from the application.
 *
 * @purpose Collect and display error messages in a unified location.
 * @algorithm
 * 1. Subscribe to error state from metrics slice
 * 2. Display each error in an ErrorDisplay component
 * 3. Allow dismissing individual errors or all errors at once
 */
import React, { useMemo } from 'react';
import styles from './ErrorPanel.module.css';
import { useMetricsSlice, selectErrors } from '@/state/metricsSlice';
import ErrorDisplay from '../molecules/ErrorDisplay';

export interface ErrorPanelProps {
  /** Optional className for container */
  className?: string;
}

/**
 * Panel displaying all error messages from the application.
 */
export const ErrorPanel: React.FC<ErrorPanelProps> = ({ className }) => {
  const errors = useMetricsSlice(selectErrors);
  const metricsActions = useMetricsSlice();
  
  // Convert errors record to array for rendering
  const errorItems = useMemo(() => {
    return Object.entries(errors).map(([fileName, error]) => ({
      fileName,
      message: error.message,
      detail: error.detail,
    }));
  }, [errors]);
  
  if (errorItems.length === 0) {
    return null;
  }
  
  const handleDismiss = (fileName: string) => {
    // Use a magic value that we'll filter out in the selector
    metricsActions.registerError(fileName, '', '');
  };
  
  const handleDismissAll = () => {
    // Clear all errors by registering empty errors for each file
    errorItems.forEach(error => {
      metricsActions.registerError(error.fileName, '', '');
    });
  };
  
  return (
    <div className={`${styles.container} ${className || ''}`.trim()}>
      {errorItems.map((error) => (
        <ErrorDisplay
          key={error.fileName}
          message={error.message}
          fileName={error.fileName}
          detail={error.detail}
          onDismiss={() => handleDismiss(error.fileName)}
          className={styles.error}
        />
      ))}
      
      {errorItems.length > 1 && (
        <button 
          className={styles.dismissAll} 
          onClick={handleDismissAll}
        >
          Dismiss all
        </button>
      )}
    </div>
  );
};

export default ErrorPanel;