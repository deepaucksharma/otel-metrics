/**
 * Progress indicator for file processing operations.
 *
 * @purpose Visualize progress of file parsing, mapping and processing operations.
 * @algorithm
 * 1. Display file name and size
 * 2. Show a progress bar that updates with current progress
 * 3. Show the current processing stage and percentage
 * 4. Provide a cancel button for long-running operations
 */
import React, { useCallback } from 'react';
import styles from './ProgressIndicator.module.css';
import { LoadingProgress } from '@/state/metricsSlice';
import { cancelParserTask } from '@/data/dispatchToWorker';

/**
 * Format bytes to human-readable size.
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format stage name to be more readable.
 */
function formatStage(stage: LoadingProgress['stage']): string {
  switch (stage) {
    case 'parsing':
      return 'Parsing';
    case 'mapping':
      return 'Converting';
    case 'processing':
      return 'Processing';
    default:
      return 'Loading';
  }
}

export interface ProgressIndicatorProps {
  /** Progress information for the file being processed */
  progress: LoadingProgress;
  /** Optional className for container */
  className?: string;
}

/**
 * Displays a progress bar and information for a file being processed.
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  className,
}) => {
  const { fileName, fileSize, progress: percentage, stage, taskId } = progress;
  
  // Calculate elapsed time
  const elapsedTime = Date.now() - progress.startTime;
  const elapsedSeconds = Math.floor(elapsedTime / 1000);
  
  // Handle cancel button click
  const handleCancel = useCallback(() => {
    if (percentage < 100) {
      cancelParserTask(taskId);
    }
  }, [taskId, percentage]);
  
  const isComplete = percentage >= 100;
  
  return (
    <div className={`${styles.container} ${isComplete ? styles.ready : ''} ${className || ''}`.trim()}>
      <div className={styles.header}>
        <div className={styles.fileName}>{fileName}</div>
        <div className={styles.fileSize}>{formatBytes(fileSize)}</div>
      </div>
      
      <div className={styles.progressWrapper}>
        <div 
          className={`${styles.progressBar} ${styles[stage]}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className={styles.footer}>
        <div className={styles.stage}>
          {isComplete ? 'Complete' : formatStage(stage)}
          {!isComplete && ` (${elapsedSeconds}s)`}
        </div>
        <div className={styles.percentage}>{percentage.toFixed(0)}%</div>
      </div>
      
      {!isComplete && (
        <button className={styles.cancelButton} onClick={handleCancel}>
          Cancel
        </button>
      )}
    </div>
  );
};

export default ProgressIndicator;