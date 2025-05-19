/**
 * Convert raw OTLP JSON payload into the internal ParsedSnapshot graph.
 *
 * See the original file for detailed algorithm and performance notes.
 */
import type {
  RawOtlpExportMetricsServiceRequest,
} from '@intellimetric/contracts/rawOtlpTypes';
import type {
  ParsedSnapshot,
  ParsedResourceData,
  ParsedScopeData,
  ParsedMetricData,
  ParsedSeriesData,
} from '@intellimetric/contracts/types';
import { encodeSeriesKey } from '../utils/seriesKeyEncoder';
import { mapAttrs, mapPoint } from './mappingUtils';
import { deriveMetric } from './metricDerivation';

/** Transform a parsed OTLP object into a ParsedSnapshot structure. */
export function mapToParsedSnapshot(
  raw: RawOtlpExportMetricsServiceRequest,
  snapshotId: string,
  fileName: string,
): ParsedSnapshot {
  const snapshot: ParsedSnapshot = {
    id: snapshotId,
    fileName,
    ingestionTimestamp: Date.now(),
    resources: [],
  };

  const resources = raw.resourceMetrics || [];
  for (const res of resources) {
    const rAttrs = mapAttrs(res.resource?.attributes);
    const rNode: ParsedResourceData = { resourceAttributes: rAttrs, scopes: [] };

    const scopes = res.scopeMetrics || [];
    for (const scope of scopes) {
      const sNode: ParsedScopeData = {
        scopeName: scope.scope?.name,
        scopeVersion: scope.scope?.version,
        scopeAttributes: mapAttrs(scope.scope?.attributes),
        metrics: [],
      };

      const metrics = scope.metrics || [];
      for (const m of metrics) {
        const metricInfo = deriveMetric(m);
        if (
          metricInfo.definition.instrumentType === 'Unknown' ||
          !metricInfo.points
        ) {
          throw new Error('Unsupported OTLP metric shape: ' + m.name);
        }

        const seriesMap: Map<string, ParsedSeriesData> = new Map();
        for (const pt of metricInfo.points) {
          const metricAttrs = mapAttrs(pt.attributes);
          const seriesKey = encodeSeriesKey(
            metricInfo.definition.name,
            rAttrs,
            metricAttrs,
          );
          const parsedPt = mapPoint(pt, metricInfo.definition.instrumentType);

          if (!seriesMap.has(seriesKey)) {
            seriesMap.set(seriesKey, {
              seriesKey,
              resourceAttributes: rAttrs,
              metricAttributes: metricAttrs,
              points: [],
            });
          }

          seriesMap.get(seriesKey)!.points.push(parsedPt);
        }

        sNode.metrics.push({
          definition: metricInfo.definition,
          seriesData: seriesMap,
        } as ParsedMetricData);
      }

      rNode.scopes.push(sNode);
    }

    snapshot.resources.push(rNode);
  }

  return snapshot;
}
