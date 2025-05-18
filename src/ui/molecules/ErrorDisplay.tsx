/**
 * Component for displaying error messages from the data layer.
 *
 * @purpose Present user-friendly error messages with optional technical details.
 * @algorithm
 * 1. Display error message with appropriate styling
 * 2. Show the file name that caused the error
 * 3. Provide collapsible technical details
 * 4. Allow dismissing the error message
 */
import React, { useState, useCallback } from 'react';
import styles from './ErrorDisplay.module.css';

export interface ErrorDisplayProps {
  /** The error message to display */
  message: string;
  /** The file name associated with the error */
  fileName: string;
  /** Optional detailed technical information */
  detail?: string;
  /** Function to call when the error is dismissed */
  onDismiss?: () => void;
  /** Optional className for container */
  className?: string;
}

/**
 * Component for displaying error messages with optional details.
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  fileName,
  detail,
  onDismiss,
  className,
}) => {
  const [showDetail, setShowDetail] = useState(false);
  
  const toggleDetail = useCallback(() => {
    setShowDetail(prev => !prev);
  }, []);
  
  return (
    <div className={`${styles.container} ${className || ''}`.trim()} role="alert">
      <div className={styles.header}>
        <div className={styles.title}>Error</div>
        {onDismiss && (
          <button 
            className={styles.closeButton} 
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        )}
      </div>
      
      <div className={styles.message}>{message}</div>
      <div className={styles.fileName}>File: {fileName}</div>
      
      {detail && (
        <div className={styles.details}>
          <button 
            className={styles.detailsButton} 
            onClick={toggleDetail}
            aria-expanded={showDetail}
          >
            {showDetail ? 'Hide details' : 'Show details'}
          </button>
          
          {showDetail && (
            <pre className={styles.detail}>{detail}</pre>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;