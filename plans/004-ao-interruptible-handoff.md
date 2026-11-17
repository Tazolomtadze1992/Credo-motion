# 004 — Make the Automatic orders step handoff interruptible

- **Commit:** none (the project is not a git repository; written 2026-11-13)
- **Severity:** HIGH
- **Category:** 4. Interruptibility & springs (also fixes a 7. Cohesion item: blur peak)
- **Estimated scope:** 3 files, ~60 lines (component, CSS, flow lib + one test file)

## Problem

Tray steps and tray titles cross-fade with CSS `@keyframes`, and every new step
immediately deletes any layer that is still fading out. `@keyframes` restart from
zero instead of retargeting, so a quick second tap (X twice, choosing an account
and bouncing back, Escape held) makes the half-faded old step vanish in one
frame, and makes the half-arrived step jump to 100% opacity before it starts to
fade out. The China transfer handles the same reversal without a snap ("a hidden
body … turns back from its current pose", `lib/transfer-motion.mjs:492`).

Second, smaller: the 2 px blur bridge peaks at the start of the entry and the end
of the exit, where the content is already invisible. China's blur peaks
mid-swap (`8 * w * (1 - w)`, `lib/transfer-motion.mjs:268`), which is what makes
the two states read as one object.

## Where

| File | Lines | What's there |
| --- | --- | --- |
| `components/AutomaticOrdersStudy.jsx` | 112–137 | `useLayers` (layer list) and `Layers` (renders layers, drops exits on `animationend`) |
| `app/studies/automatic-orders/automatic-orders.css` | 54–55 | Title enter/exit keyframes |
| `app/studies/automatic-orders/automatic-orders.css` | 69–75 | Step layer enter/exit keyframes and `@keyframes ao-in/ao-out` |
| `app/studies/automatic-orders/automatic-orders.css` | 152–154 | Reduced-motion overrides of `ao-in` / `ao-out` |
| `lib/automatic-orders-flow.mjs` | end of file | Add the pure layer reducer here so it can be tested |

### Current code

```jsx
// components/AutomaticOrdersStudy.jsx:112
function useLayers(step, resetKey) {
  const [layers, setLayers] = useState([{ id: 0, step, phase: 'idle' }]);
  const id = useRef(0), shown = useRef(step), reset = useRef(resetKey);
  useLayoutEffect(() => {
    if (reset.current !== resetKey) {
      reset.current = resetKey; shown.current = step;
      setLayers([{ id: ++id.current, step, phase: 'idle' }]);
      return;
    }
    if (shown.current === step) return;
    shown.current = step;
    setLayers(list => [...list.filter(layer => layer.phase !== 'exit').map(layer => ({ ...layer, phase: 'exit' })),
      { id: ++id.current, step, phase: 'enter' }]);
  }, [step, resetKey]);
  const drop = (layerId, event) => {
    if (event.target !== event.currentTarget) return;
    setLayers(list => list.filter(layer => layer.id !== layerId || layer.phase !== 'exit'));
  };
  return [layers, drop];
}

function Layers({ layers, drop, render, className = 'ao-layer' }) {
  return layers.map(layer => <div key={layer.id} className={className} data-phase={layer.phase} data-step={layer.step}
    data-keypad={KEYPAD_STEPS.includes(layer.step) || undefined} inert={layer.phase === 'exit' || undefined}
    aria-hidden={layer.phase === 'exit' || undefined}
    onAnimationEnd={event => layer.phase === 'exit' && drop(layer.id, event)}>{render(layer.step)}</div>);
}
```

```css
/* app/studies/automatic-orders/automatic-orders.css:54 */
.ao-title[data-phase="enter"] { animation: ao-in 170ms var(--credo-ease-out) both; }
.ao-title[data-phase="exit"] { animation: ao-out 170ms var(--credo-ease-out) both; }
/* :69 */
.ao-layers { position: relative; }
.ao-layer { --ao-scale: .96; padding: 8px 0 12px; transform-origin: 50% 0; }
.ao-layer[data-keypad] { --ao-scale: .98; }
.ao-layer[data-phase="enter"] { animation: ao-in 170ms var(--credo-ease-out) both; }
.ao-layer[data-phase="exit"] { position: absolute; top: 0; left: 0; right: 0; pointer-events: none; animation: ao-out 170ms var(--credo-ease-out) both; }
@keyframes ao-in { from { opacity: 0; transform: scale(var(--ao-scale, .96)); filter: blur(2px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes ao-out { to { opacity: 0; transform: scale(var(--ao-scale, .96)); filter: blur(2px); } }
/* :152 */
@media (prefers-reduced-motion: reduce) {
  @keyframes ao-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes ao-out { to { opacity: 0; } }
```

## Target

One registered number per layer, `--ao-w` (0 = hidden pose, 1 = shown), moved by a
**CSS transition**. A transition retargets from its current value, so a reversal
turns the layer around from wherever it is. Opacity, scale and blur are all
derived from `--ao-w`, so they stay on one clock, and enter/exit stay
complementary (same duration and curve), which keeps the approved "never a blank
frame" rule.

```css
@property --ao-w { syntax: '<number>'; inherits: false; initial-value: 1; }

.ao-layer, .ao-title {
  --ao-w: 1;
  opacity: var(--ao-w);
  transform: scale(calc(var(--ao-scale, .96) + (1 - var(--ao-scale, .96)) * var(--ao-w)));
  filter: blur(calc(8px * var(--ao-w) * (1 - var(--ao-w))));
  transition: --ao-w 170ms var(--credo-ease-out);
}
.ao-layer[data-phase="out"], .ao-title[data-phase="out"] { --ao-w: 0; }
.ao-layer[data-phase="out"] { position: absolute; top: 0; left: 0; right: 0; pointer-events: none; }
@starting-style {
  .ao-layer[data-phase="in"], .ao-title[data-phase="in"] { --ao-w: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .ao-layer, .ao-title { transform: none; filter: none; }
}
```

`.ao-title` keeps its existing `position: absolute; top: 0; left: 0; transform-origin: 0 50%` rule
(automatic-orders.css:52) and also needs `--ao-scale: .96` (it inherits nothing from `.ao-layer`).

**Why these values:**
- `170ms` and `var(--credo-ease-out)` (`cubic-bezier(.23,1,.32,1)`): unchanged. This is the user-approved Automatic orders handoff
  (study notes, "Step handoff: enter and exit share one duration and curve (170 ms, easeOut, no delay)").
- `.96` / `.98` scale: unchanged (`.ao-layer[data-keypad] { --ao-scale: .98 }` stays).
- `8px * w * (1 - w)`: China's exact blur formula (`lib/transfer-motion.mjs:268`); it peaks at 2 px when `w = .5`, and is 0 at both ends.
- `@starting-style`: gives a newly inserted entering layer its hidden pose for its first style, with no `useEffect` and no `requestAnimationFrame`.

Layer list logic (new pure function, exported from `lib/automatic-orders-flow.mjs`):

```js
/**
 * Step layers for the tray handoff. Phases: 'idle' (first render, shown, no
 * entry), 'in' (entering or shown), 'out' (leaving). Never deletes a leaving
 * layer here (it is dropped when its transition ends), and never reorders, so
 * a layer turned back keeps its DOM node and its transition retargets.
 */
export function nextLayers(list, step, newId) {
  const leaving = list.find(layer => layer.step === step && layer.phase === 'out');
  const rest = list.map(layer => layer === leaving ? { ...layer, phase: 'in' }
    : layer.phase === 'out' ? layer : { ...layer, phase: 'out' });
  return leaving ? rest : [...rest, { id: newId, step, phase: 'in' }];
}
```

## Conventions to follow

- Motion tokens live in `content/motion.mjs` and reach CSS as `--credo-ease-*` / `--credo-duration-*` (set on `<html>` in `app/layout.jsx`). Use `var(--credo-ease-out)`; do not add tokens.
- The repo's precedent for "turn back from the current pose" is `lib/transfer-motion.mjs:492–531`; the precedent for complementary opacity is the "Text swaps without a blank frame" section of `docs/motion-studies/transfers.md`.
- Pure flow logic lives in `lib/automatic-orders-flow.mjs` with tests in `tests/automatic-orders-flow.test.mjs` (Node test runner, `npm test`).

## Steps

1. Add `nextLayers` (above) to the end of `lib/automatic-orders-flow.mjs` and import it in `components/AutomaticOrdersStudy.jsx` (the import list at line ~21).
2. In `useLayers`, replace the `setLayers(list => [...list.filter(...)...])` line with
   `setLayers(list => nextLayers(list, step, ++id.current));`. Leave the reset branch unchanged (a reset still replaces everything with one `'idle'` layer).
3. Change `drop` to drop only layers whose phase is `'out'`:
   `setLayers(list => list.filter(layer => layer.id !== layerId || layer.phase !== 'out'));`
   and only for the `--ao-w` transition: `if (event.target !== event.currentTarget || event.propertyName !== '--ao-w') return;`
4. In `Layers`, rename every `'exit'` check to `'out'` (`inert`, `aria-hidden`), and replace
   `onAnimationEnd={…}` with `onTransitionEnd={event => layer.phase === 'out' && drop(layer.id, event)}`.
5. In the CSS, delete the four rules `.ao-title[data-phase="enter"|"exit"]` and `.ao-layer[data-phase="enter"|"exit"]` (lines 54, 55, 72, 73) and add the Target block after `.ao-layer[data-keypad]` (line 71). Add `--ao-scale: .96;` to the `.ao-title` rule at line 52.
6. **Keep** `@keyframes ao-in` and its reduced-motion override: `.ao-found` (line ~162) still uses it. Delete only `@keyframes ao-out` (line 75) and its reduced-motion override (line 154) if nothing else references `ao-out` (check with `grep -n "ao-out"`).
7. Add tests to `tests/automatic-orders-flow.test.mjs`:
   - a forward step keeps the old layer as `'out'` and appends one `'in'` layer;
   - returning to a step that is still `'out'` flips that same layer (same `id`) back to `'in'`, adds no layer, and does not change the array order;
   - two quick forward steps leave both earlier layers `'out'` (none deleted).

## Out of scope

- `.ao-found`, `.ao-otp` digit, `.ao-order[data-landed]`, the checkbox, the footer, the segmented control: leave their animations as they are.
- Tray height and presence (`useTrayHeight`, `openFlow`, `closeFlow`): plan 005 handles the tray.
- The China transfer files. Do not change any duration or curve.
- Do not introduce a new animation library.

## Verification

**Build**
- [ ] `npm test` passes, including the three new `nextLayers` tests.
- [ ] `npx next build` passes.

**Behavior** (`/studies/automatic-orders`, Add payment; the Browser pane must be visible or transitions will not run)
- [ ] Normal speed: picker → Categories → Electricity → back with X. Same look as today: one crossfade, no blank title frame, no blank body frame.
- [ ] Tap Categories, then X within ~80 ms (before the fade finishes): the Categories body and title turn back smoothly; nothing disappears in a single frame and nothing flashes to full opacity.
- [ ] Mash X / Escape on a deep step (review → account → back, repeatedly): the layer count in DevTools never grows without bound (exits are removed after 170 ms).
- [ ] With `prefers-reduced-motion: reduce` emulated: only opacity changes; no scale, no blur.

**Feel**
- [ ] Record the screen at 60 fps and scrub the reversal frame by frame: opacity of the two layers should always add up to ~1 and the blur should be strongest mid-swap.
- [ ] Look at it again at normal speed with fresh eyes.

## Notes

- Registered custom properties animate on the main thread, like China's rAF controller. Fine for a 170 ms crossfade; if a phone shows jank, report it rather than tuning.
- `@starting-style` and `@property` need Safari 17.5+/16.4+ and Chrome 117+/85+. The prototype targets current browsers.
- Whether the mid-swap blur reads better than today's is a feel decision for the user.
