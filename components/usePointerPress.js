'use client';

import { useCallback, useEffect } from 'react';

/**
 * Shared press feedback (moved unchanged from the China transfer): a primary
 * pointer down on an enabled button inside `rootRef` sets
 * `data-pointer-pressed`, which Keypad, List row and Primary button style as
 * the .97 press. It clears on pointer up, cancel, window blur, or when the
 * pointer leaves the button. Spread `pressProps` on the root element.
 */
export default function usePointerPress(rootRef) {
  const clear = useCallback(() => rootRef.current?.querySelectorAll('[data-pointer-pressed]')
    .forEach(node => node.removeAttribute('data-pointer-pressed')), [rootRef]);
  useEffect(() => {
    window.addEventListener('pointerup', clear);
    window.addEventListener('pointercancel', clear);
    window.addEventListener('blur', clear);
    return () => { window.removeEventListener('pointerup', clear); window.removeEventListener('pointercancel', clear); window.removeEventListener('blur', clear); clear(); };
  }, [clear]);
  const onPointerDownCapture = event => {
    const button = event.target.closest('button');
    if (event.isPrimary && event.button === 0 && button && !button.disabled) button.setAttribute('data-pointer-pressed', '');
  };
  const onPointerOutCapture = event => {
    const button = event.target.closest('button');
    if (button && !button.contains(event.relatedTarget)) button.removeAttribute('data-pointer-pressed');
  };
  return { clear, pressProps: { onPointerDownCapture, onPointerOutCapture } };
}
