import type { ParsedSnapshot, SeriesKey } from '@/contracts/types';

/**
 * Event type definitions for the event bus.
 * Maps event names to their payload types.
 */
export interface EventTypes {
  'data.snapshot.parsed': { snapshot: ParsedSnapshot };
  'data.snapshot.error': { fileName: string; error: string; detail?: string };
  'data.snapshot.load.start': { fileName: string; fileSize: number };
  'data.snapshot.load.progress': { 
    fileName: string; 
    taskId: string;
    progress: number; // 0-100 percentage
    stage: 'parsing' | 'mapping' | 'processing' 
  };
  'data.snapshot.load.cancel': { fileName: string; taskId: string };
  
  'ui.inspector.open': { 
    snapshotId: string; 
    metricName: string;
    seriesKey: SeriesKey;
    pointId: number;
  };
  'ui.inspector.close': void;
  'ui.metric.inspect': { snapshotId: string; metricName: string };
}
