# StaticFileProvider.tsx – spec  
*(Data-Provider nano-module · UI · ≈ 120 LoC)*

---

## 1. Purpose

Browser-side "file-loader" UI that funnels snapshot files into the validation → read → worker pipeline, and surfaces progress / errors.

---

## 2. Public Props

```ts
interface StaticFileProviderProps {
  acceptGzip?   : boolean;   // default true
  maxSizeBytes? : number;    // override 100 MiB
  className?    : string;    // styling hook
}
```

No callbacks required—events are broadcast via the global bus.

## 3. Visual Behaviour
| State | UI |
|-------|-----|
| Idle | Dropzone with icon and help text |
| Drag-over | Border highlight (.dragActive) |
| Loading file | Inline list: "🚀 reading … filename.json" |
| Parse success | Replaces line with "✅ loaded snapshot id" |
| Error | Inline red text + emits data.error |

Component never blocks—the longest work (parsing) is in workers.

## 4. Internal Flow

```
<input type="file" multiple hidden> (ref=fileInput)

onClick dropzone → fileInput.click()

handleFiles(files):
  for each file:
    id ← uuid
    bus.emit('data.snapshot.loading', {fileId:id,fileName:file.name})
    v ← validateFile(file)
      └ if left  → bus.error + status update + continue
    text ← await readFileContent(v.right)
      └ try/catch → bus.error on failure
    await dispatchToParserWorker({snapshotId:'snap-'+id, fileName:file.name, rawJson:text})
      └ promise resolves with parsedSnapshot OR parserError
      └ update status + forward bus event accordingly
```

Loading list kept in local useState<Record<string,string>>.

## 5. Event Emissions
| Event | When |
|-------|------|
| data.snapshot.loading | immediately on each file pick |
| data.snapshot.loaded | resolve parsedSnapshot |
| data.error | any validation/read/worker failure |

Payload formats per eventBus.md.

## 6. Dependencies
validateFile.ts

readFile.ts

dispatchToWorker.ts

services/eventBus.ts

React, useState/useCallback

Minimal CSS: .dropArea, .dragActive, .statusList

## 7. Tests
DOM (RTL): pick two files → status list shows both, resolves ✓.

Drag-over toggles .dragActive.

Error path: oversize file triggers red status and data.error.

Worker success: mock worker returns parsedSnapshot → data.snapshot.loaded fired.

## 8. Accessibility
<label> wraps visually hidden input for keyboard activation.

role="button" + tabIndex=0 on dropzone; Enter triggers file dialog.

Announce load completion via aria-live="polite".

## 9. Perf Budget
UI thread work per file ≤ 5 ms; heavy work delegated.