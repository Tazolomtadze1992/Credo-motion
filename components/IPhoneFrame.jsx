import './iphone-frame.css';

export const IPHONE_SCREEN = { width: 390, height: 852 };
export const IPHONE_FRAME = { width: 414, height: 876 };

export function PhoneFrameToggle({ enabled, onToggle }) {
  return <button className="phone-frame-toggle" type="button" aria-label="iPhone frame" aria-pressed={enabled} onClick={onToggle}><svg viewBox="0 0 16 20" width="13" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><rect x="2.5" y="1" width="11" height="18" rx="3" /><path d="M6 3h4M6 17h4" strokeLinecap="round" /></svg>{enabled ? 'Hide phone frame' : 'Show phone frame'}</button>;
}

export default function IPhoneFrame({ enabled = true, screenHeight = IPHONE_SCREEN.height, children }) {
  return <div className="iphone-frame" data-enabled={enabled} style={{ '--frame-screen-height': `${screenHeight}px` }}>
    <div className="iphone-frame-shell" aria-hidden="true">
      <div className="iphone-frame-glass" />
      <span className="iphone-frame-speaker" />
      <span className="iphone-frame-button iphone-frame-mute" />
      <span className="iphone-frame-button iphone-frame-volume-up" />
      <span className="iphone-frame-button iphone-frame-volume-down" />
      <span className="iphone-frame-button iphone-frame-power" />
      <span className="iphone-frame-antenna iphone-frame-antenna--left-top" />
      <span className="iphone-frame-antenna iphone-frame-antenna--right-top" />
      <span className="iphone-frame-antenna iphone-frame-antenna--left-bottom" />
      <span className="iphone-frame-antenna iphone-frame-antenna--right-bottom" />
    </div>
    <div className="iphone-frame-screen">{children}</div>
    <div className="iphone-frame-island" aria-hidden="true"><span className="iphone-frame-sensor" /><span className="iphone-frame-camera" /></div>
  </div>;
}
