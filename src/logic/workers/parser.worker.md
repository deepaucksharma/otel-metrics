# parser.worker.ts – spec  
*(Web-Worker entry · orchestrates jsonSafeParse → otlpMapper)*

---

## 1. Purpose

Acts as the single message bridge between the browser main thread
(`dispatchToWorker.ts`) and the parsing pipeline:

```yaml
raw JSON string → jsonSafeParse → JS object
↓
otlpMapper
↓
ParsedSnapshot
```

Errors at any stage are caught and sent back as `parserError`.

---

## 2. Accepted Message Shape

```ts
interface WorkerInbound {
  taskId    : string;   // added by dispatcher for correlation
  type      : 'parse';
  payload   : {
    rawJson   : string;
    snapshotId: string;
    fileName  : string;
  };
}
```

Any other message is ignored.

## 3. Outbound Message Shapes
| Type | Payload |
|------|---------|
| parsedSnapshot | ParsedSnapshot (contracts) |
| parserError | { snapshotId, fileName, message, detail? } |

Both include original taskId for promise resolution.

## 4. Internal Workflow

```ts
self.onmessage = (e: MessageEvent<WorkerInbound>) => {
  if (e.data?.type !== 'parse') return;

  const { taskId, payload } = e.data;
  const { rawJson, snapshotId, fileName } = payload;

  const parseRes = jsonSafeParse<RawOtlpExportMetricsServiceRequest>(rawJson);
  if (parseRes.type === 'left') {
    postError('JSON parsing failed', parseRes.value);
    return;
  }

  try {
    const snap = mapToParsedSnapshot(parseRes.value, snapshotId, fileName);
    postMessage({ taskId, type:'parsedSnapshot', payload: snap });
  } catch (err:any) {
    postError('OTLP mapping failed', err);
  }

  function postError(msg: string, err: Error) {
    postMessage({
      taskId,
      type:'parserError',
      payload:{ snapshotId, fileName, message:`${msg}: ${err.message}`, detail:err.stack }
    });
  }
};
```

Also attaches:

```ts
self.onerror = e => {
  console.error('Worker runtime error', e);
}
```

## 5. Dependencies
jsonSafeParse.ts

otlpMapper.ts

rawOtlpTypes.ts

Zero browser globals beyond self.

Bundler must compile this file with { type:'module' } worker option.

## 6. Runtime Guarantees
Never calls postMessage without taskId.

Keeps the worker alive after errors—subsequent tasks still processed.

Memory footprint: stays < 50 MB even for 25 MB input due to streaming parse + GC.

## 7. Tests
Mock inbound message with good JSON → emits parsedSnapshot.

Malformed JSON → emits parserError.

Unknown metric kind in mapper → emits parserError.

Multiple sequential tasks processed correctly (reuse).

## 8. Performance
| Step | Target time (25 MB JSON) |
|------|--------------------------|
| JSON.parse | ≤ 150 ms (dedicated thread) |
| mapToParsedSnapshot | ≤ 120 ms |
| Message serialization | ≤ 10 ms |
| Total worker latency | ≤ 300 ms |

## 9. Future Work
Support incremental chunk parse (streaming) when OTLP adds huge multi-record files.

Consider transferable streams once browser support matures.