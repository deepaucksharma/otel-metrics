/**
 * @layer Config
 * @summary TODO
 *
 * ## Purpose
 *
 * TODO
 *
 * ## Algorithm/Visual
 *
 * TODO
 *
 * @perfBudget TODO
 * @loc_estimate TODO
 */

/**
 * Central location for numeric defaults and feature switches.
 */

/**
 * Default threshold used by components like `CRingSvg` to determine
 * when a metric is considered high cardinality.
 *
 * @remarks
 * Adjust this value to tune how aggressively the UI highlights metrics
 * with many series. Lowering it will flag high cardinality sooner while
 * raising it will make the indicator less sensitive.
 */
export const DEFAULT_THRESHOLD_HIGH = 2000;

