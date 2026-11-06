'use client';

import { useEffect, useRef, useState } from 'react';
import IPhoneFrame, { PhoneFrameToggle } from './IPhoneFrame';

const asset = name => `/assets/my-space/${name}.svg`;

// Match the foreground artwork, not the SVGs' pale background/empty bounds.
// Both scenes occupy 86px from y=8 to y=94 inside the same 96px art slot.
function ArtFrame({ top, bottom, children }) {
  const scale = 86 / (bottom - top);
  return <div className="myspace-art" aria-hidden="true">
    <div className="myspace-art-scene" style={{ transform: `translateY(${8 - top * scale}px) scale(${scale})` }}>{children}</div>
  </div>;
}

function SavingsArt() {
  return <ArtFrame top={9.23} bottom={94.69}>
    <img src={asset('savings_background')} alt="" style={{ left: 0, top: 0, width: 128.84, height: 89.28 }} />
    <img src={asset('savings_backdrop')} alt="" style={{ left: 20.04, top: 2.79, width: 87.48, height: 81.97 }} />
    <img src={asset('savings_shadow')} alt="" style={{ left: 14.46, top: 90.17, width: 99.92, height: 5.83 }} />
    <img src={asset('savings_banknotes_back')} alt="" style={{ left: 29.83, top: 9.23, width: 70.8, height: 30.79 }} />
    <img src={asset('savings_banknotes_front')} alt="" style={{ left: 42.56, top: 33.3, width: 67.49, height: 61.39 }} />
    <img src={asset('savings_character')} alt="" style={{ left: 17.97, top: 37.78, width: 58.67, height: 56.57 }} />
  </ArtFrame>;
}

function JournalArt() {
  return <ArtFrame top={5.27} bottom={94.60}>
    <img src={asset('journal_shadow')} alt="" style={{ left: 14.41, top: 90.17, width: 99.8, height: 5.83 }} />
    <img src={asset('journal_background')} alt="" style={{ left: 0, top: 0, width: 128.69, height: 87.41 }} />
    <img src={asset('journal_backdrop')} alt="" style={{ left: 19.76, top: 3.84, width: 89.09, height: 70.47 }} />
    <img src={asset('journal_character')} alt="" style={{ left: 26.82, top: 8.09, width: 26.09, height: 84.76 }} />
    <img src={asset('journal_group')} alt="" style={{ left: 52.63, top: 5.27, width: 49.42, height: 89.33 }} />
  </ArtFrame>;
}

const clamp = number => Math.max(0, Math.min(1, number));

const CARD_EXPANSION = 308;
// Compression keeps its approved phase; visibility follows the full resize.
const JOURNAL_COMPRESSION_PROGRESS = .55;
// Critically damped springs: ~99.6% settled at 300ms / 240ms.
const CARD_OMEGA = 26;
const PILL_OMEGA = 32;
// Progress is already spring-eased: do not apply another shortened fade curve.
const journalOpacity = progress => 1 - clamp(progress);
// Join the surfaces before the Journal's final settle, using the same spring.
const mergeOpacity = progress => clamp((progress - .15) / .5);
// Same custom curve as the existing description fade and DialKit preview.
function contentEase(progress) {
  const p = clamp(progress);
  let lo = 0, hi = 1;
  const bezier = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
  for (let i = 0; i < 16; i++) {
    const t = (lo + hi) / 2;
    if (bezier(t, .25, .45) < p) lo = t; else hi = t;
  }
  return p === 0 || p === 1 ? p : bezier((lo + hi) / 2, .46, .94);
}

export default function MySpaceStudy() {
  const [framed, setFramed] = useState(true);
  const holderRef = useRef(null), fitRef = useRef(null);
  const phoneRef = useRef(null);
  const stageRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    const phone = phoneRef.current;
    const pill = phone.querySelector('.myspace-selection');
    const savings = phone.querySelector('.myspace-savings-card');
    const surface = phone.querySelector('.myspace-savings-surface');
    const content = phone.querySelector('.myspace-savings-content');
    const savingsContentMask = phone.querySelector('.myspace-savings-content-mask');
    const journal = phone.querySelector('.myspace-journal-card');
    const journalSurface = phone.querySelector('.myspace-journal-surface');
    const mergedSurface = phone.querySelector('.myspace-merged-surface');
    const journalContent = phone.querySelector('.myspace-journal-content');
    const journalHeadingCompact = phone.querySelector('.myspace-journal-heading-compact');
    const sharedSavingsLabel = phone.querySelector('.myspace-shared-label-savings');
    const sharedJournalLabel = phone.querySelector('.myspace-shared-label-journal');
    const categories = phone.querySelector('.myspace-categories');
    const categoryItems = [...categories.querySelectorAll(':scope > button, :scope > .myspace-category-static')];
    let pillBounds = [{ left: 0, width: 69 }, { left: 79, width: 76 }, { left: 270, width: 175 }];
    let pillWidth = 500;
    const allDescription = phone.querySelector('.myspace-description-all');
    const saveDescription = phone.querySelector('.myspace-description-save');
    const tabs = [...phone.querySelectorAll('.myspace-category-button')];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const running = new Map();
    let mode = 'all';
    let timeline = null;
    let dock = null;
    let timelineFactory = null;
    let timelineCategory = 'save';
    const minimumHeightScale = .88;
    const savingsFadeSpeed = 3;
    let timelineVisible = false;
    let previewActive = false;
    let disposed = false;
    let springFrame = 0;
    let springTime = 0;
    let suppressPreview = false;
    const cardSpring = { value: 0, velocity: 0, target: 0, omega: CARD_OMEGA };
    const journalSpring = { value: 0, velocity: 0, target: 0, omega: CARD_OMEGA };
    const pillSpring = { value: 0, velocity: 0, target: 0, omega: PILL_OMEGA };
    const pillSizeSpring = { value: 69, velocity: 0, target: 69, omega: PILL_OMEGA };

    let direct = false;
    let directFade = 0;
    let directMove = 0;
    let directTween = null;
    let lastFrame = null;
    let handoff = null;

    function sampleDirect(time) {
      if (!directTween) return;
      const { start, fade, move, target } = directTween;
      const elapsed = time - start;
      directFade = fade + (target - fade) * contentEase(elapsed / 160);
      directMove = move + (target - move) * contentEase(elapsed / 220);
      if (elapsed >= 220) directTween = null;
    }

    function paintGeometry(card, selection, fadeCards = true) {
      const progress = clamp(card);
      const expandedJournal = clamp(journalSpring.value);
      const left = Math.max(0, selection);
      const width = Math.max(1, pillSizeSpring.value);
      pill.style.clipPath = `inset(0px ${Math.max(0, pillWidth - left - width)}px 0px ${left}px round 16px)`;
      const push = reduceMotion.matches ? 0 : expandedJournal;
      const compression = (1 - minimumHeightScale) * clamp(push / JOURNAL_COMPRESSION_PROGRESS);
      const savingsScale = 1 - compression;
      const clearance = clamp(push / .2);
      const journalPush = reduceMotion.matches ? 0 : progress;
      let frame = {
        sy: -264 * push, ss: savingsScale, cy: 135 * progress,
        jy: CARD_EXPANSION * journalPush - 264 * expandedJournal,
        js: 1 - (1 - minimumHeightScale) * clamp(journalPush / JOURNAL_COMPRESSION_PROGRESS),
        // Double the compact Journal heading-to-content gap: 16px → 32px.
        jcy: 16 + 119 * expandedJournal,
        sb: CARD_EXPANSION * (1 - progress), jb: CARD_EXPANSION * (1 - expandedJournal),
        mb: 44 * (1 - expandedJournal), mo: mergeOpacity(expandedJournal),
        jo: journalOpacity(progress), so: journalOpacity(expandedJournal),
        co: savingsContentOpacity(expandedJournal), ho: 1 - clamp(expandedJournal / .55),
        edge: Math.max(0, (40 + 16 * clearance + 264 * push - 248 * compression) / savingsScale),
        feather: (16 + 8 * clearance) / savingsScale
      };
      if (direct) {
        // Both expanded views share a centered slot and one continuous surface.
        // Only the content groups exchange; the approved heading keeps its spring.
        frame = {
          sy: 0, ss: 1, cy: 135 - (reduceMotion.matches ? 0 : 8 * directMove),
          jy: -264, js: 1, jcy: 135 + (reduceMotion.matches ? 0 : 8 * (1 - directMove)),
          sb: 0, jb: 0, mb: 0, mo: 1, jo: directFade, so: 0,
          co: 1 - directFade, ho: 0, edge: 40, feather: 16
        };
      }
      if (handoff) {
        if (!handoff.offsets) {
          handoff.offsets = Object.fromEntries(Object.keys(frame).map(key => [key, handoff.from[key] - frame[key]]));
          // Invisible content can take its entrance position without a long trip.
          if (handoff.from.co < .001) for (const key of ['sy', 'ss', 'cy', 'edge', 'feather']) handoff.offsets[key] = 0;
          if (handoff.from.jo < .001) for (const key of ['jy', 'js', 'jcy']) handoff.offsets[key] = 0;
        }
        const remaining = 1 - contentEase((performance.now() - handoff.start) / 220);
        for (const key of Object.keys(frame)) frame[key] += handoff.offsets[key] * remaining;
        if (!remaining) handoff = null;
      }
      lastFrame = frame;
      savings.style.transform = `translateY(${frame.sy}px) scaleY(${frame.ss})`;
      content.style.transform = `translateY(${frame.cy}px)`;
      journal.style.transform = `translateY(${frame.jy}px) scaleY(${frame.js})`;
      journalContent.style.transform = `translateY(${frame.jcy}px)`;
      surface.style.clipPath = `inset(0px 0px ${frame.sb}px 0px round 16px)`;
      journalSurface.style.clipPath = `inset(0px 0px ${frame.jb}px 0px round 16px)`;
      mergedSurface.style.clipPath = `inset(0px 0px ${frame.mb}px 0px round 16px)`;
      journalHeadingCompact.style.opacity = String(clamp(frame.ho));
      const mask = reduceMotion.matches ? 'none' : `linear-gradient(to bottom, transparent ${frame.edge}px, #000 ${frame.edge + frame.feather}px)`;
      savingsContentMask.style.maskImage = savingsContentMask.style.webkitMaskImage = mask;
      if (fadeCards || direct) {
        mergedSurface.style.opacity = String(clamp(frame.mo));
        journal.style.opacity = String(clamp(frame.jo));
        surface.style.opacity = String(clamp(frame.so));
        savingsContentMask.style.opacity = String(clamp(frame.co));
      }
      if (fadeCards) paintHeading(expandedJournal);
    }

    // Higher values fade the Savings art/copy earlier; 1 preserves the baseline.
    // Mapping from the shared progress keeps reversals and scrubbing deterministic.
    function savingsContentOpacity(progress) {
      return Math.pow(1 - clamp(progress), savingsFadeSpeed);
    }

    function paintHeading(progress) {
      // Let the outgoing content clear the header before its label changes.
      const mix = clamp((progress - .4) / .45);
      sharedSavingsLabel.style.opacity = String(1 - mix);
      sharedJournalLabel.style.opacity = String(mix);
      paintHeadingMotion(mix);
    }

    function paintHeadingMotion(mix, instant = false) {
      const still = instant || reduceMotion.matches;
      // A short directional crossfade prevents two sharp words sharing a baseline.
      sharedSavingsLabel.style.transform = still ? 'none' : `translateY(${-8 * mix}px)`;
      sharedJournalLabel.style.transform = still ? 'none' : `translateY(${8 * (1 - mix)}px)`;
      const blur = still ? 0 : 8 * mix * (1 - mix); // 2px maximum, zero at rest.
      sharedSavingsLabel.style.filter = sharedJournalLabel.style.filter = blur ? `blur(${blur}px)` : 'none';
    }

    function keepTabVisible(next) {
      const selected = tabs.find(tab => tab.dataset.category === next);
      const left = selected.offsetLeft;
      const right = left + selected.offsetWidth;
      if (left < categories.scrollLeft + 24) categories.scrollLeft = Math.max(0, left - 24);
      else if (right > categories.scrollLeft + categories.clientWidth - 24) categories.scrollLeft = right - categories.clientWidth + 24;
    }

    function springStep(time) {
      const dt = Math.max(0, (time - springTime) / 1000);
      springTime = time;
      let moving = false;
      for (const spring of [cardSpring, journalSpring, pillSpring, pillSizeSpring]) {
        const displacement = spring.value - spring.target;
        const coefficient = spring.velocity + spring.omega * displacement;
        const decay = Math.exp(-spring.omega * dt);
        spring.value = spring.target + (displacement + coefficient * dt) * decay;
        spring.velocity = (spring.velocity - spring.omega * coefficient * dt) * decay;
        if (Math.abs(spring.value - spring.target) < .0001 && Math.abs(spring.velocity) < .002) {
          spring.value = spring.target;
          spring.velocity = 0;
        } else moving = true;
      }
      sampleDirect(time);
      paintGeometry(cardSpring.value, pillSpring.value);
      moving ||= !!directTween || !!handoff;
      springFrame = moving ? requestAnimationFrame(springStep) : 0;
    }

    function pausePreview() {
      // Pausing DialKit may publish a frame. Live state must not be overwritten.
      suppressPreview = true;
      timeline?.pause();
      suppressPreview = false;
    }

    function fitPhone() {
      const framed = holderRef.current.dataset.framed === 'true';
      const top = window.innerWidth < 700 ? 128 : 88;
      const reserved = top + (timelineVisible ? 260 : 12);
      stageRef.current.style.paddingBottom = timelineVisible ? '260px' : '12px';
      const scale = Math.min(1, (window.innerWidth - 40) / (framed ? 414 : 390), (window.innerHeight - reserved) / (849 + (framed ? 24 : 0)));
      const displayScale = Number(Math.max(.35, scale).toFixed(4));
      const hitHeight = 44 / displayScale;
      document.documentElement.style.setProperty('--myspace-scale', String(displayScale));
      phone.style.setProperty('--myspace-category-height', `${hitHeight}px`);
      phone.style.setProperty('--myspace-category-top', `${165 - hitHeight / 2}px`);
      const labels = [...pill.children];
      categoryItems.forEach((item, index) => { labels[index].style.width = `${item.offsetWidth}px`; });
      pillWidth = categoryItems.at(-1).offsetLeft + categoryItems.at(-1).offsetWidth - 24;
      pill.style.width = `${pillWidth}px`;
      pillBounds = tabs.map(tab => ({ left: tab.offsetLeft - 24, width: tab.offsetWidth }));
      paintGeometry(cardSpring.value, pillSpring.value, false);
    }
    fitRef.current = fitPhone;

    function stopAnimations() {
      cancelAnimationFrame(springFrame);
      springFrame = 0;
      for (const animation of running.values()) animation.cancel();
      running.clear();
    }

    function animateProperty(element, property, target, duration, easing, instant) {
      const key = `${element.className}:${property}`;
      const current = getComputedStyle(element)[property];
      running.get(key)?.cancel();
      running.delete(key);
      element.style[property] = current;
      if (instant || current === target || duration < 1) {
        element.style[property] = target;
        return;
      }
      const animation = element.animate([{ [property]: current }, { [property]: target }], { duration, easing, fill: 'forwards' });
      running.set(key, animation);
      animation.finished.then(() => {
        if (disposed || running.get(key) !== animation) return;
        element.style[property] = target;
        animation.cancel();
        running.delete(key);
      }, () => {});
    }

    function updateSelection(next) {
      mode = next;
      phone.dataset.mode = next;
      tabs.forEach(tab => tab.setAttribute('aria-selected', String(tab.dataset.category === next)));
      phone.querySelector('.myspace-content').setAttribute('aria-labelledby', `myspace-${next}`);
      journal.setAttribute('aria-hidden', String(next === 'save'));
      savings.setAttribute('aria-hidden', String(next === 'journal'));
      allDescription.setAttribute('aria-hidden', String(next === 'save'));
      saveDescription.setAttribute('aria-hidden', String(next !== 'save'));
    }

    function setMode(next, instant = false) {
      if (next === mode && !previewActive && !instant) return;
      pausePreview();
      const wasPreview = previewActive;
      const wasDirect = direct;
      const previousMode = mode;
      const nextDirect = next !== 'all' && (direct || (previousMode !== 'all' && next !== previousMode));
      if (nextDirect) {
        // The direct renderer owns these opacities. Retire any overview fades
        // before it paints, including their completion callbacks.
        for (const element of [mergedSurface, journal, surface, savingsContentMask]) {
          const key = `${element.className}:opacity`;
          const animation = running.get(key);
          running.delete(key);
          animation?.cancel();
        }
      }
      if (instant) handoff = null;
      if (nextDirect !== direct) {
        const inFlight = previewActive || !!directTween || Math.abs(cardSpring.value - cardSpring.target) > .001 || Math.abs(journalSpring.value - journalSpring.target) > .001;
        handoff = inFlight && !instant && !reduceMotion.matches && lastFrame ? { from: { ...lastFrame }, start: performance.now() } : null;
        direct = nextDirect;
        if (direct) directFade = directMove = previousMode === 'journal' ? 1 : 0;
      }
      if (direct) {
        sampleDirect(performance.now());
        const destination = next === 'journal' ? 1 : 0;
        directTween = instant ? null : { start: performance.now(), fade: directFade, move: directMove, target: destination };
        if (instant) directFade = directMove = destination;
      } else directTween = null;
      previewActive = false;
      const target = next === 'save' ? 1 : 0;
      const noTravel = instant || reduceMotion.matches;
      updateSelection(next);
      if (direct) {
        if (!wasPreview || !wasDirect) selectTimeline(next === 'journal' ? 'save-journal' : 'journal-save');
      } else if (next !== 'all') selectTimeline(next);
      else if (wasDirect) selectTimeline(previousMode === 'journal' ? 'journal' : 'save');
      keepTabVisible(next);
      cardSpring.target = target;
      journalSpring.target = next === 'journal' ? 1 : 0;
      const bounds = pillBounds[next === 'journal' ? 2 : target];
      pillSpring.target = bounds.left;
      pillSizeSpring.target = bounds.width;
      if (noTravel) {
        cancelAnimationFrame(springFrame);
        springFrame = 0;
        for (const spring of [cardSpring, journalSpring, pillSpring, pillSizeSpring]) {
          spring.value = spring.target;
          spring.velocity = 0;
        }
        paintGeometry(cardSpring.value, pillSpring.value, false);
        if (!direct) {
          animateProperty(mergedSurface, 'opacity', String(mergeOpacity(journalSpring.target)), 160, 'ease', instant);
          animateProperty(journal, 'opacity', String(1 - target), 160, 'ease', instant);
          animateProperty(surface, 'opacity', String(1 - journalSpring.target), 160, 'ease', instant);
          animateProperty(savingsContentMask, 'opacity', String(1 - journalSpring.target), Math.min(200, 160 / savingsFadeSpeed), 'ease', instant);
        }
        paintHeadingMotion(journalSpring.target, true);
        const headingMix = clamp(Number(getComputedStyle(sharedJournalLabel).opacity));
        const headingDuration = 160 * Math.abs(journalSpring.target - headingMix);
        animateProperty(sharedSavingsLabel, 'opacity', String(1 - journalSpring.target), headingDuration, 'ease', instant);
        animateProperty(sharedJournalLabel, 'opacity', String(journalSpring.target), headingDuration, 'ease', instant);
      } else if (!springFrame) {
        springTime = performance.now();
        springFrame = requestAnimationFrame(springStep);
      }
      if (direct && !instant && !springFrame) {
        springTime = performance.now();
        springFrame = requestAnimationFrame(springStep);
      }
      const descriptionTarget = direct ? 1 : target;
      const currentMix = clamp(Number(getComputedStyle(saveDescription).opacity));
      const fadeDuration = 160 * Math.abs(descriptionTarget - currentMix);
      animateProperty(allDescription, 'opacity', String(1 - descriptionTarget), fadeDuration, 'cubic-bezier(.25,.46,.45,.94)', instant || (direct && !wasDirect && previousMode === 'journal'));
      animateProperty(saveDescription, 'opacity', String(descriptionTarget), fadeDuration, 'cubic-bezier(.25,.46,.45,.94)', instant || (direct && !wasDirect && previousMode === 'journal'));
    }

    function paintTimeline(values) {
      if (disposed || suppressPreview) return;
      stopAnimations();
      previewActive = true;
      handoff = directTween = null;
      direct = timelineCategory.includes('-');
      const pillValue = clamp(Number(values.pill.current.progress));
      const surfaceValue = clamp(Number((values.surface ?? values.heading).current.progress));
      const mix = clamp(Number(values.description?.current.mix ?? 0));
      if (direct) {
        const reverse = timelineCategory === 'journal-save';
        directFade = reverse ? 1 - values.fade.current.mix : values.fade.current.mix;
        directMove = reverse ? 1 - values.movement.current.mix : values.movement.current.mix;
        const headingProgress = reverse ? 1 - surfaceValue : surfaceValue;
        cardSpring.value = 1 - headingProgress;
        journalSpring.value = headingProgress;
        updateSelection(directFade >= .5 ? 'journal' : 'save');
        const from = pillBounds[reverse ? 2 : 1], to = pillBounds[reverse ? 1 : 2];
        const p = reduceMotion.matches ? Math.round(pillValue) : pillValue;
        pillSpring.value = from.left + (to.left - from.left) * p;
        pillSizeSpring.value = from.width + (to.width - from.width) * p;
        cardSpring.velocity = journalSpring.velocity = pillSpring.velocity = pillSizeSpring.velocity = 0;
        paintGeometry(cardSpring.value, pillSpring.value);
        allDescription.style.opacity = '0';
        saveDescription.style.opacity = '1';
        return;
      }
      updateSelection(surfaceValue >= .5 ? timelineCategory : 'all');
      const geometry = reduceMotion.matches ? Math.round(surfaceValue) : surfaceValue;
      cardSpring.value = timelineCategory === 'save' ? geometry : 0;
      journalSpring.value = timelineCategory === 'journal' ? geometry : 0;
      const selectionProgress = reduceMotion.matches ? Math.round(pillValue) : pillValue;
      const bounds = pillBounds[timelineCategory === 'journal' ? 2 : 1];
      pillSpring.value = bounds.left * selectionProgress;
      pillSizeSpring.value = pillBounds[0].width + (bounds.width - pillBounds[0].width) * selectionProgress;
      cardSpring.velocity = journalSpring.velocity = pillSpring.velocity = pillSizeSpring.velocity = 0;
      paintGeometry(cardSpring.value, pillSpring.value, !reduceMotion.matches);
      if (reduceMotion.matches) {
        mergedSurface.style.opacity = String(timelineCategory === 'journal' ? mergeOpacity(surfaceValue) : 0);
        paintHeading(timelineCategory === 'journal' ? surfaceValue : 0);
        journal.style.opacity = String(timelineCategory === 'save' ? journalOpacity(surfaceValue) : 1);
        surface.style.opacity = String(timelineCategory === 'journal' ? journalOpacity(surfaceValue) : 1);
        savingsContentMask.style.opacity = String(timelineCategory === 'journal' ? savingsContentOpacity(surfaceValue) : 1);
      }
      allDescription.style.opacity = timelineCategory === 'save' ? 1 - mix : 1;
      saveDescription.style.opacity = timelineCategory === 'save' ? mix : 0;
    }

    function selectTimeline(category) {
      if (!timelineFactory || (timeline && timelineCategory === category)) return;
      timeline?.destroy();
      timelineCategory = category;
      timeline = timelineFactory(category);
      timeline.subscribe(paintTimeline, false);
    }

    async function initTimeline() {
      const { createDialTimeline, createDialTimelineRoot } = await import('dialkit/vanilla');
      if (disposed) return;
      timelineFactory = category => createDialTimeline(category === 'save' ? 'All → Save' : category === 'journal' ? 'All → Journal' : category === 'save-journal' ? 'Savings → Journal' : 'Journal → Savings', {
        duration: .42,
        pill: { at: 0, duration: .24, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'spring', stiffness: PILL_OMEGA ** 2, damping: 2 * PILL_OMEGA, mass: 1 } },
        [category.includes('-') ? 'heading' : 'surface']: { at: 0, duration: .3, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'spring', stiffness: CARD_OMEGA ** 2, damping: 2 * CARD_OMEGA, mass: 1 } },
        ...(category.includes('-') ? {
          fade: { at: 0, duration: .16, from: { mix: 0 }, to: { mix: 1 }, transition: { type: 'easing', duration: .16, ease: [.25, .46, .45, .94] } },
          movement: { at: 0, duration: .22, from: { mix: 0 }, to: { mix: 1 }, transition: { type: 'easing', duration: .22, ease: [.25, .46, .45, .94] } }
        } : {}),
        ...(category === 'save' ? { description: { at: 0, duration: .16, from: { mix: 0 }, to: { mix: 1 }, transition: { type: 'easing', duration: .16, ease: [.25, .46, .45, .94] } } } : {})
      }, { autoplay: false, persist: true, id: category === 'save' ? 'credo-myspace-all-save-v2' : `credo-myspace-${category === 'journal' ? 'all-journal' : category}` });
      selectTimeline(mode === 'journal' ? 'journal' : 'save');
      dock = createDialTimelineRoot({
        theme: 'light', defaultVisible: timelineVisible, defaultOpen: true,
        onVisibilityChange: visible => {
          if (timelineVisible !== visible) {
            timelineVisible = visible;
            syncTimelineVisibility();
          }
        }
      });

    }

    function toggleTimeline() {
      timelineVisible = !timelineVisible;
      dock?.setVisible(timelineVisible);
      syncTimelineVisibility();
    }

    function syncTimelineVisibility() {
      if (timelineVisible && timeline && !previewActive) {
        const atStart = timelineCategory === 'save-journal' ? mode === 'save' : timelineCategory === 'journal-save' ? mode === 'journal' : mode === 'all';
        timeline.seek(atStart ? 0 : timeline.values.duration);
      }
      if (!timelineVisible) setMode(mode);
      toggleRef.current.textContent = timelineVisible ? 'Hide timeline' : 'Show timeline';
      fitPhone();
    }

    function onFrameKey(event) {
      if (!timelineVisible || !timeline || (event.key !== ',' && event.key !== '.')) return;
      if (event.target.closest('input, textarea, [contenteditable="true"]')) return;
      event.preventDefault();
      timeline.pause();
      timeline.seek(Math.max(0, Math.min(timeline.values.duration, timeline.values.time + (event.key === '.' ? 1 : -1) / 60)));
    }

    const tabListeners = tabs.map(tab => {
      const onClick = event => setMode(tab.dataset.category, event.detail === 0);
      const onKeyDown = event => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        const index = tabs.indexOf(tab);
        const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length].dataset.category;
        setMode(next, true);
        phone.querySelector(`[data-category="${next}"]`).focus();
      };
      tab.addEventListener('click', onClick);
      tab.addEventListener('keydown', onKeyDown);
      return () => { tab.removeEventListener('click', onClick); tab.removeEventListener('keydown', onKeyDown); };
    });

    paintGeometry(0, 0);
    allDescription.style.opacity = '1';
    saveDescription.style.opacity = '0';
    fitPhone();
    initTimeline();
    const onMotionChange = () => previewActive && timeline ? paintTimeline(timeline.values) : setMode(mode, true);
    window.addEventListener('resize', fitPhone);
    toggleRef.current.addEventListener('click', toggleTimeline);
    document.addEventListener('keydown', onFrameKey);
    reduceMotion.addEventListener('change', onMotionChange);

    return () => {
      disposed = true;
      fitRef.current = null;
      stopAnimations();
      tabListeners.forEach(remove => remove());
      window.removeEventListener('resize', fitPhone);
      toggleRef.current?.removeEventListener('click', toggleTimeline);
      document.removeEventListener('keydown', onFrameKey);
      reduceMotion.removeEventListener('change', onMotionChange);
      timeline?.destroy();
      dock?.destroy();
    };
  }, []);
  useEffect(() => { fitRef.current?.(); }, [framed]);

  return <>
    <div className="phone-study-tools"><PhoneFrameToggle enabled={framed} onToggle={() => setFramed(value => !value)} /><button className="myspace-timeline-toggle" type="button" ref={toggleRef}>Show timeline</button></div>
    <main className="myspace-stage" aria-label="My Space prototype" ref={stageRef}>
      <div className="myspace-holder" ref={holderRef} data-framed={framed} style={{ '--device-width': `${framed ? 414 : 390}px`, '--device-height': `${849 + (framed ? 24 : 0)}px` }}>
        <IPhoneFrame enabled={framed} screenHeight={849}>
        <div className="myspace-phone" data-mode="all" ref={phoneRef}>
          <div className="myspace-status" aria-hidden="true">
            <span>9:41</span>
            <img className="myspace-cellular" src={asset('cellular')} alt="" />
            <img className="myspace-wifi" src={asset('wifi')} alt="" />
            <img className="myspace-battery" src={asset('battery')} alt="" />
          </div>
          <header className="myspace-header"><h1>ჩემი სივრცე</h1></header>
          <div className="myspace-categories" role="tablist" aria-label="My Space category">
            <span className="myspace-selection" aria-hidden="true"><span>ყველა</span><span>აგროვე</span><span>ფინანსების ჟურნალი</span><span>ლოიალობა</span><span>დაზღვევები</span></span>
            <button type="button" className="myspace-category-button" data-category="all" role="tab" aria-selected="true" aria-controls="myspace-content" id="myspace-all">ყველა</button>
            <button type="button" className="myspace-category-button" data-category="save" role="tab" aria-selected="false" aria-controls="myspace-content" id="myspace-save">აგროვე</button>
            <button type="button" className="myspace-category-button" data-category="journal" role="tab" aria-selected="false" aria-controls="myspace-content" id="myspace-journal">ფინანსების ჟურნალი</button>
            <span className="myspace-category-static">ლოიალობა</span>
            <span className="myspace-category-static">დაზღვევები</span>
          </div>
          <div className="myspace-content" id="myspace-content" role="tabpanel" aria-labelledby="myspace-all">
            <div className="myspace-merged-surface" aria-hidden="true" />
            <div className="myspace-shared-heading" aria-hidden="true">
              <div className="myspace-card-heading">
                <span className="myspace-info"><img src={asset('info')} alt="" /></span>
                <span className="myspace-shared-labels">
                  <span className="myspace-shared-label-savings">აგროვე</span>
                  <span className="myspace-shared-label-journal">ფინანსების ჟურნალი</span>
                </span>
              </div>
            </div>
            <section className="myspace-savings-card" aria-label="აგროვე" aria-hidden="false">
              <div className="myspace-savings-surface" aria-hidden="true" />
              <div className="myspace-savings-content-mask">
                <div className="myspace-savings-content">
                  <SavingsArt />
                  <div className="myspace-description">
                    <span className="myspace-description-all" aria-hidden="false">ააგროვე თანხა სასურველი მიზნისთვის</span>
                    <span className="myspace-description-save" aria-hidden="true">არ გაქვს აქტიური ჩანაწერები</span>
                  </div>
                  <span className="myspace-action">დაიწყე აგროვება</span>
                </div>
              </div>
            </section>
            <section className="myspace-journal-card" aria-label="ფინანსების ჟურნალი" aria-hidden="false">
              <div className="myspace-journal-surface" aria-hidden="true" />
              <div className="myspace-card-heading myspace-journal-heading-compact" aria-hidden="true"><span className="myspace-info"><img src={asset('info')} alt="" /></span><span>ფინანსების ჟურნალი</span></div>
              <div className="myspace-journal-content"><JournalArt /><p>ჩაინიშნეთ დასაბრუნებელი თანხები</p><span className="myspace-action">შექმენი ჩანაწერი</span></div>
            </section>
          </div>
          <nav className="myspace-nav" aria-label="App navigation">
            <div className="myspace-nav-row">
              {[
                ['nav_home','მთავარი'],['nav_products','პროდუქტები'],['nav_transfer','ოპერაციები'],['nav_myspace','ჩემი სივრცე'],['nav_more','მეტი']
              ].map(([icon,label]) => <div className={`myspace-nav-item${icon === 'nav_myspace' ? ' is-current' : ''}`} key={icon}><img src={asset(icon)} alt="" /><span>{label}</span></div>)}
            </div>
            <div className="myspace-home-indicator" aria-hidden="true" />
          </nav>
        </div>
        </IPhoneFrame>
      </div>
    </main>
  </>;
}
