/**
 * Panel displaying all active file processing operations.
 *
 * @purpose Provide a unified view of all ongoing file processing tasks with progress indicators.
 * @algorithm
 * 1. Select all progress information from state
 * 2. Render progress indicators for each active task
 * 3. Allow users to control panel visibility
 * 4. Provide a way to cancel all operations at once
 */
import React, { useMemo, useCallback } from 'react';
import styles from './ProgressPanel.module.css';
import { useMetricsSlice, selectProgress, LoadingProgress } from '@/state/metricsSlice';
import { useUiSlice, selectIsProgressPanelOpen } from '@/state/uiSlice';
import ProgressIndicator from '../atoms/ProgressIndicator';

export interface ProgressPanelProps {
  /** Optional className for container */
  className?: string;
}

/**
 * Panel displaying all active file processing operations with progress bars.
 */
export const ProgressPanel: React.FC<ProgressPanelProps> = ({ className }) => {
  const isOpen = useUiSlice(selectIsProgressPanelOpen);
  const progress = useMetricsSlice(selectProgress);
  const closePanel = useUiSlice(state => state.closeProgressPanel);

  // Convert progress record to sorted array (most recent first)
  const progressItems = useMemo(() => {
    return Object.values(progress).sort((a, b) => {
      // Completed items at the bottom
      if (a.progress >= 100 && b.progress < 100) return 1;
      if (a.progress < 100 && b.progress >= 100) return -1;
      
      // Otherwise sort by start time (newest first)
      return b.startTime - a.startTime;
    });
  }, [progress]);
  
  // Check if we have any active items (not at 100%)
  const hasActiveItems = useMemo(() => {
    return progressItems.some(item => item.progress < 100);
  }, [progressItems]);
  
  // Only show completed items for 3 seconds after completion
  const visibleItems = useMemo(() => {
    const now = Date.now();
    return progressItems.filter(item => {
      // Always show active items
      if (item.progress < 100) return true;
      
      // Show completed items for 3 seconds
      return now - item.startTime < 3000;
    });
  }, [progressItems]);
  
  // Auto-hide the panel when there are no items to show
  const shouldShow = visibleItems.length > 0 && isOpen;
  
  return (
    <div className={`${styles.container} ${!shouldShow ? styles.hidden : ''} ${className || ''}`.trim()}>
      {visibleItems.length > 0 && (
        <>
          <div className={styles.header}>
            <div className={styles.title}>
              {hasActiveItems ? 'Processing Files...' : 'Processing Complete'}
            </div>
            <button 
              className={styles.closeButton} 
              onClick={closePanel}
              aria-label="Close progress panel"
            >
              ✕
            </button>
          </div>
          
          {visibleItems.map((item) => (
            <ProgressIndicator 
              key={item.taskId} 
              progress={item}
            />
          ))}
        </>
      )}
      
      {visibleItems.length === 0 && (
        <div className={styles.noProgress}>
          No active processing tasks
        </div>
      )}
    </div>
  );
};

export default ProgressPanel;