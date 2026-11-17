'use client';

import { useState } from 'react';
import Icon from './Icon';
import './upload-slot.css';

/**
 * Credo upload slot (Proposed, auto lombard 2026-11-16): one photo or video to
 * add. A tappable tile on the quiet button surface, so it reads as an action;
 * no dashed borders or file-format text.
 *
 * The label always sits under the tile, so adding a photo never moves the
 * layout. state: 'empty' (icon) · 'uploading' · 'done' (the image, with a
 * check, or a play mark for video) · 'error' (outline and a message under it).
 * `icon` names the placeholder icon (camera by default); `image` is the
 * captured thumbnail. `wide` spans the full width (the car video).
 *
 * Motion (plan 010 G2): state changes are CSS transitions, so a quick retake
 * turns around. They run only after the state changes here (data-live), so a
 * slot that mounts already done (Back, reopening the tray) arrives with its
 * step and does not replay.
 */
export default function UploadSlot({ label, state = 'empty', icon = 'camera', image, error, kind = 'photo', wide = false, onClick, className = '', ...props }) {
  const [initialState] = useState(state);
  const [live, setLive] = useState(false);
  if (!live && state !== initialState) setLive(true);
  const done = state === 'done' && image;
  return <div className={`credo-upload ${className}`} data-state={state} data-kind={kind} data-wide={wide || undefined}
    data-filled={done || undefined} data-live={live || undefined}>
    <button type="button" className="credo-upload__tile" onClick={onClick} disabled={state === 'uploading'}
      aria-label={`${label}${state === 'done' ? ', added. Retake' : state === 'error' ? `, ${error ?? 'try again'}` : ''}`} {...props}>
      <span className="credo-upload__visual">
        {/* The spinner stays under the arriving photo and fades out (100 ms) as it fades in (170 ms). */}
        <span className="credo-upload__icon" aria-hidden="true">{state === 'uploading' || done ? <span className="credo-upload__spinner" /> : <Icon name={state === 'error' ? 'retake' : icon} size="content" />}</span>
        {done && <>
          <img className="credo-upload__image" src={image} alt="" draggable="false" />
          <span className="credo-upload__mark" aria-hidden="true"><Icon name={kind === 'video' ? 'play' : 'check'} size="small" /></span>
        </>}
      </span>
    </button>
    <span className="credo-upload__caption" aria-hidden="true">{label}</span>
    {state === 'error' && error && <span className="credo-upload__error" role="alert"><Icon name="alert" size="badge" />{error}</span>}
  </div>;
}
