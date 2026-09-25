'use client';

import { useEffect, useRef } from 'react';

const intro = 'გახდი კრედო რჩეული! მოითხოვე და დაიმტკიცე Mastercard World Elite საკრედიტო ბარათი Mycredo-დან, დააგროვე კრედო Cool-ები და გამოიყენე ისინი სხვადასხვა გადახდის შესასრულებლად.';

const lists = {
  earn: [
    'გადაიხადე კრედო ბანკის Mastercard World Elite საკრედიტო ბარათით ყოველდღიური შესყიდვებისა და მომსახურებების საფასური.',
    'ყოველი შესაბამისი გადახდის შემდეგ ავტომატურად დაგერიცხება Cool-ები.',
    'დაგროვებული ქულების ბალანსი და ისტორია ნებისმიერ დროს იხილე აპლიკაციაში.'
  ],
  spend: [
    'გამოიყენე დაგროვებული Cool-ები კომუნალური გადასახადების გადასახდელად.',
    'შეავსე მობილური ბალანსი დაგროვებული Cool-ებით.',
    'გადახდისას აირჩიე Cool-ებით გადახდის შესაძლებლობა და დაადასტურე ოპერაცია.'
  ]
};

export default function LoyaltyStudy() {
  const phoneRef = useRef(null);
  const stageRef = useRef(null);
  const timelineToggleRef = useRef(null);

  useEffect(() => {
    const phone = phoneRef.current;
    const earn = phone.querySelector('.check-list.earn');
    const spend = phone.querySelector('.check-list.spend');
    const thumb = phone.querySelector('.tab-thumb');
    const tabs = [...phone.querySelectorAll('.tab-button')];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const textRows = {
      earn: [...earn.querySelectorAll('li')],
      spend: [...spend.querySelectorAll('li')]
    };
    const rowTops = { earn: [], spend: [] };
    const markers = [...phone.querySelectorAll('.check-marker')].map(el => ({ el, y: 0, target: 0, velocity: 0 }));
    let mode = 'earn';
    let springFrame = 0;
    let springTime = 0;
    let textAnimations = [];
    let textRevision = 0;
    let timeline = null;
    let dock = null;
    let timelineVisible = false;
    let previewActive = false;
    let disposed = false;

    function measureRows() {
      for (const key of ['earn', 'spend']) rowTops[key] = textRows[key].map(row => row.offsetTop);
    }

    function alignTextWithMarkers() {
      for (const key of ['earn', 'spend']) {
        textRows[key].forEach((row, index) => {
          row.style.transform = `translateY(${markers[index].y - rowTops[key][index]}px)`;
        });
      }
    }

    function fitPhone() {
      const reserved = timelineVisible ? 260 : 24;
      stageRef.current.style.paddingBottom = timelineVisible ? '260px' : '12px';
      const scale = Math.min(1, (window.innerWidth - 24) / 390, (window.innerHeight - reserved) / 888);
      document.documentElement.style.setProperty('--screen-scale', Math.max(.35, scale).toFixed(4));
    }

    function setTimelineVisible(visible) {
      timelineVisible = visible;
      dock?.setVisible(visible);
      if (visible && timeline && !previewActive) timeline.seek(mode === 'spend' ? timeline.values.duration : 0);
      if (!visible) timeline?.pause();
      timelineToggleRef.current.textContent = visible ? 'Hide timeline' : 'Show timeline';
      fitPhone();
    }

    function onToggleTimeline() {
      setTimelineVisible(!timelineVisible);
    }

    function springStep(time) {
      const dt = Math.max(0, (time - springTime) / 1000);
      springTime = time;
      let moving = false;
      const omega = 22.2;
      markers.forEach(marker => {
        const displacement = marker.y - marker.target;
        const coefficient = marker.velocity + omega * displacement;
        const decay = Math.exp(-omega * dt);
        marker.y = marker.target + (displacement + coefficient * dt) * decay;
        marker.velocity = (marker.velocity - omega * coefficient * dt) * decay;
        if (Math.abs(marker.y - marker.target) < .02 && Math.abs(marker.velocity) < .2) {
          marker.y = marker.target;
          marker.velocity = 0;
        } else moving = true;
        marker.el.style.transform = `translateY(${marker.y}px)`;
      });
      alignTextWithMarkers();
      springFrame = moving ? requestAnimationFrame(springStep) : 0;
    }

    function positionMarkers(next, instant = false) {
      markers.forEach((marker, index) => {
        marker.target = rowTops[next][index];
        if (instant || reducedMotion.matches) {
          marker.y = marker.target;
          marker.velocity = 0;
          marker.el.style.transform = `translateY(${marker.y}px)`;
        }
      });
      alignTextWithMarkers();
      if (instant || reducedMotion.matches) {
        cancelAnimationFrame(springFrame);
        springFrame = 0;
      } else if (!springFrame) {
        springTime = performance.now();
        springFrame = requestAnimationFrame(springStep);
      }
    }

    function crossfadeText(next) {
      const progress = Math.max(0, Math.min(1, Number(getComputedStyle(spend).opacity)));
      const target = next === 'spend' ? 1 : 0;
      const revision = ++textRevision;
      earn.style.opacity = 1 - progress;
      spend.style.opacity = progress;
      textAnimations.forEach(animation => animation.cancel());
      earn.setAttribute('aria-hidden', String(next !== 'earn'));
      spend.setAttribute('aria-hidden', String(next !== 'spend'));
      const options = {
        duration: 160 * Math.abs(target - progress),
        easing: 'cubic-bezier(.25,.46,.45,.94)', fill: 'forwards'
      };
      const animations = [
        earn.animate([{ opacity: 1 - progress }, { opacity: 1 - target }], options),
        spend.animate([{ opacity: progress }, { opacity: target }], options)
      ];
      const startTime = document.timeline.currentTime;
      if (startTime !== null) animations.forEach(animation => { animation.startTime = startTime; });
      textAnimations = animations;
      Promise.all(animations.map(animation => animation.finished)).then(() => {
        if (disposed || revision !== textRevision) return;
        earn.style.opacity = 1 - target;
        spend.style.opacity = target;
        animations.forEach(animation => animation.cancel());
        textAnimations = [];
      }, () => {});
    }

    function setMode(next) {
      if (next === mode) return;
      mode = next;
      phone.dataset.mode = mode;
      tabs.forEach(tab => tab.setAttribute('aria-selected', String(tab.dataset.tab === mode)));
      positionMarkers(next);
      crossfadeText(next);
    }

    function selectLiveMode(next) {
      if (timeline) timeline.pause();
      if (previewActive) {
        previewActive = false;
        phone.classList.remove('timeline-preview');
        thumb.style.transform = '';
      }
      setMode(next);
    }

    function paintTimeline(values) {
      if (disposed) return;
      previewActive = true;
      cancelAnimationFrame(springFrame);
      springFrame = 0;
      ++textRevision;
      textAnimations.forEach(animation => animation.cancel());
      textAnimations = [];
      phone.classList.add('timeline-preview');
      const mix = Math.max(0, Math.min(1, Number(values.text.current.mix)));
      mode = mix >= .5 ? 'spend' : 'earn';
      phone.dataset.mode = mode;
      thumb.style.transform = `translateX(${values.tab.current.x}%)`;
      tabs.forEach(tab => tab.setAttribute('aria-selected', String(tab.dataset.tab === mode)));
      earn.style.opacity = 1 - mix;
      spend.style.opacity = mix;
      earn.setAttribute('aria-hidden', String(mode !== 'earn'));
      spend.setAttribute('aria-hidden', String(mode !== 'spend'));
      const positions = values.checkmarks.current;
      markers.forEach((marker, index) => {
        marker.y = Number(positions[`y${index + 1}`]);
        marker.velocity = 0;
        marker.el.style.transform = `translateY(${marker.y}px)`;
      });
      alignTextWithMarkers();
    }

    async function initTimeline() {
      const { createDialTimeline, createDialTimelineRoot } = await import('dialkit/vanilla');
      if (disposed) return;
      const from = Object.fromEntries(rowTops.earn.map((top, index) => [`y${index + 1}`, top]));
      const to = Object.fromEntries(rowTops.spend.map((top, index) => [`y${index + 1}`, top]));
      timeline = createDialTimeline('Earn → spend', {
        duration: .42,
        tab: {
          at: 0, duration: .24,
          from: { x: 0 }, to: { x: 100 },
          transition: { type: 'easing', duration: .24, ease: [.645, .045, .355, 1] }
        },
        text: {
          at: 0, duration: .16,
          from: { mix: 0 }, to: { mix: 1 },
          transition: { type: 'easing', duration: .16, ease: [.25, .46, .45, .94] }
        },
        checkmarks: {
          at: 0, from, to,
          transition: { type: 'spring', stiffness: 493, damping: 44.4, mass: 1 }
        }
      }, { autoplay: false, persist: true, id: 'credo-loyalty-transition' });
      timeline.subscribe(paintTimeline, false);
      dock = createDialTimelineRoot({ theme: 'light', defaultVisible: timelineVisible, defaultOpen: true });
    }

    function onFrameKey(event) {
      if (!timeline || (event.key !== ',' && event.key !== '.')) return;
      if (event.target.closest('input, textarea, [contenteditable="true"]')) return;
      event.preventDefault();
      timeline.pause();
      timeline.seek(Math.max(0, Math.min(timeline.values.duration, timeline.values.time + (event.key === '.' ? 1 : -1) / 60)));
    }

    const tabListeners = tabs.map(tab => {
      const onClick = () => selectLiveMode(tab.dataset.tab);
      const onKeyDown = event => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        const next = event.key === 'ArrowRight' ? 'spend' : 'earn';
        selectLiveMode(next);
        phone.querySelector(`[data-tab="${next}"]`).focus();
      };
      tab.addEventListener('click', onClick);
      tab.addEventListener('keydown', onKeyDown);
      return () => {
        tab.removeEventListener('click', onClick);
        tab.removeEventListener('keydown', onKeyDown);
      };
    });

    earn.style.opacity = 1;
    spend.style.opacity = 0;
    measureRows();
    positionMarkers('earn', true);
    fitPhone();
    window.addEventListener('resize', fitPhone);
    timelineToggleRef.current.addEventListener('click', onToggleTimeline);
    document.addEventListener('keydown', onFrameKey);
    const onMotionChange = () => previewActive && timeline ? paintTimeline(timeline.values) : positionMarkers(mode, true);
    reducedMotion.addEventListener('change', onMotionChange);
    document.fonts.ready.then(() => {
      if (disposed) return;
      measureRows();
      positionMarkers(mode, true);
      initTimeline();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(springFrame);
      textAnimations.forEach(animation => animation.cancel());
      tabListeners.forEach(remove => remove());
      window.removeEventListener('resize', fitPhone);
      timelineToggleRef.current?.removeEventListener('click', onToggleTimeline);
      document.removeEventListener('keydown', onFrameKey);
      reducedMotion.removeEventListener('change', onMotionChange);
      timeline?.destroy();
      dock?.destroy();
    };
  }, []);

  return (
    <><button className="study-timeline-toggle" type="button" ref={timelineToggleRef}>Show timeline</button>
    <main className="stage" aria-label="Credo loyalty prototype" ref={stageRef}>
      <div className="phone-holder">
        <div className="phone" data-mode="earn" id="prototype-phone" ref={phoneRef}>
          <div className="status" aria-hidden="true"><span className="time">9:41</span><img className="cellular" src="/assets/cellular.png" alt="" /><img className="wifi" src="/assets/wifi.png" alt="" /><img className="battery" src="/assets/battery.png" alt="" /></div>
          <div className="nav"><img className="back" src="/assets/back.png" alt="" /><div className="nav-title">ლოიალობის პროგრამა</div></div>
          <img className="coin" src="/assets/coin.png" alt="" />
          <p className="intro">{intro}</p>
          <div className="tab-track" role="tablist" aria-label="Loyalty information">
            <span className="tab-thumb" aria-hidden="true" />
            <button type="button" className="tab-button" role="tab" id="prototype-phone-earn-tab" aria-controls="prototype-phone-earn-panel" aria-selected="true" data-tab="earn">დაგროვება</button>
            <button type="button" className="tab-button" role="tab" id="prototype-phone-spend-tab" aria-controls="prototype-phone-spend-panel" aria-selected="false" data-tab="spend">დახარჯვა</button>
          </div>
          <div className="check-stage">
            {Object.entries(lists).map(([key, items]) => (
              <ul className={`check-list ${key}`} role="tabpanel" id={`prototype-phone-${key}-panel`} aria-labelledby={`prototype-phone-${key}-tab`} aria-hidden={key === 'earn' ? 'false' : 'true'} key={key}>
                {items.map(item => <li key={item}><span>{item}</span></li>)}
              </ul>
            ))}
            {lists.earn.map((_, index) => <img className="check-marker" src="/assets/check.png" alt="" aria-hidden="true" key={index} />)}
          </div>
          <div className="footer"><div className="footer-button">დახურვა</div><div className="home-indicator" aria-hidden="true" /></div>
        </div>
      </div>
    </main></>
  );
}
