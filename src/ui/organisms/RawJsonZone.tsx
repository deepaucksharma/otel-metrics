import React from 'react';
import { CopyButton } from '@/ui/atoms/CopyButton';
import type { ParsedPoint, AttrMap } from '@/contracts/types';
import styles from './RawJsonZone.module.css';
import { useRawJson } from './useRawJson';

/**
 * Collapsible JSON view of raw metric data with copy capabilities.
 *
 * Provides a debugging escape hatch for viewing and copying the raw metric
 * data associated with a single data point.
 *
 * ### Props
 * - `metricName` – name of the metric being inspected.
 * - `point` – the parsed data point object.
 * - `resourceAttrs` – resource level attributes.
 * - `metricAttrs` – metric level attributes.
 * - `initialCollapsed` – whether the view is collapsed on first render.
 *
 * ### Rendering notes
 * - Shows only the header when collapsed.
 * - Expands to show formatted JSON, optionally including surrounding
 *   resource and scope context.
 * - Users can toggle between data point only and full context views.
 * - Copy button copies whichever JSON is currently displayed.
 *
 * ### Accessibility
 * - Buttons include appropriate `aria-label` attributes.
 * - Collapsible section can be toggled with keyboard navigation.
 * - Text contrast follows the design token guidance.
 *
 * ### Tests
 * - Initial render collapsed displays only the header.
 * - Expanding reveals JSON content.
 * - Toggling context switches between point-only and full context JSON.
 * - Copy button copies the displayed JSON to the clipboard.
 * - Large content remains scrollable and performant.
 */
export interface RawJsonZoneProps {
  /** Metric name */
  metricName: string;
  /** The data point object */
  point: ParsedPoint;
  /** Resource-level attributes */
  resourceAttrs: AttrMap;
  /** Metric-level attributes */
  metricAttrs: AttrMap;
  /** Initial collapsed state (default: true) */
  initialCollapsed?: boolean;
}

export const RawJsonZone: React.FC<RawJsonZoneProps> = ({
  metricName,
  point,
  resourceAttrs,
  metricAttrs,
  initialCollapsed = true,
}) => {
  const {
    isCollapsed,
    toggleCollapse,
    showFullContext,
    toggleFullContext,
    displayJson,
    getCopyValue,
  } = useRawJson(
    metricName,
    point,
    resourceAttrs,
    metricAttrs,
    initialCollapsed
  );

  if (isCollapsed) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>RAW DATA</h3>
          <div className={styles.actions}>
            <button
              className={styles.toggleButton}
              onClick={toggleCollapse}
              aria-label="Expand raw data"
            >
              ▼
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>RAW DATA</h3>
        <div className={styles.actions}>
          <button
            className={styles.toggleButton}
            onClick={toggleCollapse}
            aria-label="Collapse raw data"
          >
            ▲
          </button>
          <CopyButton copyValue={getCopyValue()} ariaLabel="Copy JSON" />
        </div>
      </div>

      <div className={styles.content}>
        <pre className={styles.jsonDisplay}>
          <code>{displayJson}</code>
        </pre>

        <button
          className={styles.contextToggle}
          onClick={toggleFullContext}
          aria-label={showFullContext ? 'Show data point only' : 'Show full context'}
        >
          {showFullContext ? '▲ Show data point only' : '▼ Show full context'}
        </button>
      </div>
    </div>
  );
};
