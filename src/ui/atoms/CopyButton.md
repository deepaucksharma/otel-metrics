# CopyButton.tsx – spec  
*(UI Atom · quick-copy to clipboard)*

---

## 1. Purpose

Provide a **universal, tiny** button that copies a supplied string to the user's
clipboard and gives immediate visual feedback (icon swap + tooltip).  
Used throughout the Inspector (attribute rows, raw JSON zone).

---

## 2. Public Props

```ts
interface CopyButtonProps {
  /** String value sent to `navigator.clipboard.writeText` */
  copyValue: string;
  /** Optional aria-label (defaults to "Copy to clipboard") */
  ariaLabel?: string;
  /** Icon size px – default 14 */
  size?: number;
  /** Optional className for wrapper <button>. */
  className?: string;
}
```

## 3. Visual States
| State | Icon (lucide-react) | Tooltip text |
|-------|---------------------|--------------|
| Idle | Clipboard | "Copy" |
| Copied (2 s) | Check (green) | "Copied!" |
| Error | X (red) | "Failed" |

Tooltip implemented via title attribute—no extra library.

## 4. Implementation Outline

```tsx
import { Clipboard, Check, X } from 'lucide-react';
import styles from './CopyButton.module.css';
import clsx from 'clsx';
import { useState } from 'react';

export const CopyButton: React.FC<CopyButtonProps> = ({
  copyValue,
  ariaLabel = 'Copy to clipboard',
  size = 14,
  className
}) => {
  const [state, setState] = useState<'idle'|'ok'|'err'>('idle');

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(copyValue);
      setState('ok');
      setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('err');
      setTimeout(() => setState('idle'), 2000);
    }
  };

  const Icon =
    state === 'ok'  ? Check :
    state === 'err' ? X :
                      Clipboard;

  return (
    <button
      type="button"
      className={clsx(styles.btn, className)}
      onClick={handleClick}
      title={state === 'ok' ? 'Copied!' : state === 'err' ? 'Failed' : 'Copy'}
      aria-label={ariaLabel}
    >
      <Icon size={size} strokeWidth={1.8}/>
    </button>
  );
};
```

CopyButton.module.css:

```css
.btn {
  background: transparent;
  border: none;
  padding: 2px;
  color: var(--iconGrey);
  cursor: pointer;
}
.btn:hover   { color: var(--iconHover); }
.btn:active  { transform: scale(0.95); }
```

Design tokens:

```css
:root {
  --iconGrey  : #9e9e9e;
  --iconHover : #e0e0e0;
}
```

## 5. Accessibility
aria-label always present.

Focus ring via global :focus-visible style.

## 6. Consumers
AttributeRow molecule – copies "key=value".

RawJsonZone – "Copy minimal JSON".

Could be reused anywhere else in app.

## 7. Tests / Storybook
Story: interactive knob to change copyValue.

Jest: mock navigator.clipboard.writeText → resolves / rejects.

## 8. Performance
No re-renders except internal state change (icon).
Clipboard API call is async but cheap.

## 9. Future
If design demands global toast instead of icon swap, lift copy logic into a
small useCopy() hook and keep this atom just as a wrapper.