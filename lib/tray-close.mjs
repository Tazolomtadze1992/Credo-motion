// What a tray's round X does (navigation-and-closing pattern, decided
// 2026-11-13; enforced in the Tray component 2026-11-16): on the first step it
// closes the tray; on any later step it steps back. The label says which.
// Flows pass `onBack` only when there is a previous step, and always `onClose`.

/**
 * @param {{ onBack?: Function, onClose?: Function, backLabel?: string, closeLabel?: string }} props
 * @returns {{ kind: 'back' | 'close', onClick: Function, label: string } | null}
 */
export function trayCloseAction({ onBack, onClose, backLabel = 'Back', closeLabel = 'Close' }) {
  if (onBack) return { kind: 'back', onClick: onBack, label: backLabel };
  if (onClose) return { kind: 'close', onClick: onClose, label: closeLabel };
  return null;
}
