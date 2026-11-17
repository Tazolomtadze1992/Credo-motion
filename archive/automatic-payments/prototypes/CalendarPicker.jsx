'use client';

import { useLayoutEffect, useRef } from 'react';
import { createCalendar } from '../../../lib/payment-day.mjs';
import { dateCopy } from './data.mjs';

export default function CalendarPicker({ day, onPick }) {
  const root = useRef(null);
  const range = useRef(null);
  const fill = useRef(null);
  const description = useRef(null);
  const ignoredEnglishDescription = useRef(null);
  const controller = useRef(null);
  const dragging = useRef(false);
  const initialDay = useRef(day);
  const pick = useRef(onPick);

  useLayoutEffect(() => { pick.current = onPick; }, [onPick]);
  useLayoutEffect(() => {
    const input = range.current;
    function localize() {
      const label = dateCopy(controller.current?.value() ?? initialDay.current);
      description.current.textContent = label;
      if (input.getAttribute('aria-valuetext') !== label) input.setAttribute('aria-valuetext', label);
    }
    controller.current = createCalendar({
      root: root.current, range: input, fill: fill.current, description: ignoredEnglishDescription.current,
      onCommit(value) { localize(); pick.current(value); },
    });
    controller.current.setDay(initialDay.current, true);
    localize();
    // The original controller also publishes while settling a pointer release.
    const observer = new MutationObserver(localize);
    observer.observe(input, { attributes: true, attributeFilter: ['aria-valuetext'] });
    return () => { observer.disconnect(); controller.current.destroy(); controller.current = null; };
  }, []);

  function endDrag(instant) {
    if (!dragging.current) return;
    dragging.current = false;
    controller.current.endDrag(instant);
  }

  return <div className="pp-calendar">
    <div ref={root} aria-hidden="true">
      <div className="ap-calendar">
        <div className="ap-calendar-stack ap-calendar-stack--back" /><div className="ap-calendar-stack" />
        <div className="ap-calendar-header">გადახდის დღე</div>
        <div className="ap-calendar-body">
          <div className="ap-calendar-half ap-calendar-half--top"><span className="ap-calendar-copy" data-calendar-top>{day}</span></div>
          <div className="ap-calendar-half ap-calendar-half--bottom"><span className="ap-calendar-copy" data-calendar-bottom>{day}</span></div>
          <div className="ap-calendar-leaf" data-calendar-leaf>
            <div className="ap-leaf-face ap-leaf-front"><span className="ap-calendar-copy" data-front-copy>{day}</span><div className="ap-leaf-shade" data-leaf-shade /></div>
            <div className="ap-leaf-face ap-leaf-back"><span className="ap-calendar-copy" data-back-copy>{day}</span><div className="ap-leaf-shade" data-leaf-shade /></div>
          </div>
          <div className="ap-calendar-seam" />
        </div>
      </div>
    </div>
    <div className="ap-day-control">
      <div className="ap-slider">
        <div className="ap-slider-track" aria-hidden="true"><div ref={fill} /></div>
        <input ref={range} type="range" min="1" max="31" step="1" defaultValue={day} aria-label="თვის დღის არჩევა" aria-valuetext={dateCopy(day)}
          onPointerDown={event => {
            if (!event.isPrimary || event.button !== 0) return;
            dragging.current = true;
            controller.current.beginDrag();
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerUp={() => endDrag(false)} onPointerCancel={() => endDrag(true)} onLostPointerCapture={() => endDrag(false)}
          onKeyDown={event => { if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(event.key)) { event.stopPropagation(); controller.current.prepareKeyboard(); } }}
          onInput={event => {
            const calendar = controller.current;
            if (dragging.current) calendar.track(event.currentTarget.value);
            else { calendar.setDay(event.currentTarget.value, true); calendar.commit(); }
          }}
          onBlur={() => endDrag(true)}
        />
      </div>
      <div className="ap-slider-labels" aria-hidden="true"><span>პირველი დღე</span><span>ბოლო დღე</span></div>
    </div>
    <p className="pp-date-description" ref={description}>{dateCopy(day)}</p>
    <span hidden ref={ignoredEnglishDescription} />
  </div>;
}
