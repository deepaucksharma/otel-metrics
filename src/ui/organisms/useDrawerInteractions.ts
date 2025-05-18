import { useState, useCallback } from 'react';

import { useCloseOnEsc } from './useCloseOnEsc';

export function useDrawerInteractions(
  onClose: () => void,
  onSimulateDrop?: (key: string, drop: boolean) => void
) {
  const [focusedAttrKey, setFocusedAttrKey] = useState<string | null>(null);
  const [droppedKey, setDroppedKey] = useState<string | null>(null);

  const handleToggleDrop = useCallback(
    (attrKey: string, nextState: boolean) => {
      if (onSimulateDrop) {
        onSimulateDrop(attrKey, nextState);
      }
      setDroppedKey(nextState ? attrKey : null);
    },
    [onSimulateDrop]
  );

  useCloseOnEsc(onClose);

  return {
    focusedAttrKey,
    setFocusedAttrKey,
    droppedKey,
    handleToggleDrop
  };
}
