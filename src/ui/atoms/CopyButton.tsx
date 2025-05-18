/**
 * @layer UI Components
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

import React, { useState } from 'react';
import clsx from 'clsx';
import { Clipboard, Check, X } from 'lucide-react';
import styles from './CopyButton.module.css';

/**
 * Props for {@link CopyButton}.
 *
 * @property copyValue - String value to write to the clipboard.
 * @property ariaLabel - Optional aria-label for the button. Defaults to
 * "Copy to clipboard".
 * @property size - Icon pixel size, defaults to `14`.
 * @property className - Optional additional className for the button element.
 */
export interface CopyButtonProps {
  copyValue: string;
  ariaLabel?: string;
  size?: number;
  className?: string;
}

/**
 * Universal button that copies a string to the clipboard and shows feedback.
 *
 * Visual state cycles between idle, success and error using icon changes and
 * `title` tooltip text. Component maintains a small piece of internal state
 * to track the last copy attempt result.
 *
 * Accessibility: `aria-label` is always present and focus ring is provided via
 * the global `:focus-visible` style. The button stops propagation so parent
 * click handlers do not fire accidentally.
 *
 * Tests should mock `navigator.clipboard.writeText` to verify both resolved and
 * rejected paths.
 */
export const CopyButton: React.FC<CopyButtonProps> = ({
  copyValue,
  ariaLabel = 'Copy to clipboard',
  size = 14,
  className
}) => {
  const [state, setState] = useState<'idle' | 'ok' | 'err'>('idle');

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
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

  const Icon = state === 'ok' ? Check : state === 'err' ? X : Clipboard;

  return (
    <button
      type="button"
      className={clsx(styles.btn, className)}
      onClick={handleClick}
      title={state === 'ok' ? 'Copied!' : state === 'err' ? 'Failed' : 'Copy'}
      aria-label={ariaLabel}
    >
      <Icon size={size} strokeWidth={1.8} />
    </button>
  );
};
