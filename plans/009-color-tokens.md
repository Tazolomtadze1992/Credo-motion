# 009 — Credo colour tokens in OKLCH (revised for better-colors)

- **Written:** 2026-11-16; **revised** the same day to follow the `better-colors` skill (the first version
  followed `oklch-skill` only). The project is not a git repository.
- **Method:** both installed skills. Every value was computed (sRGB gamut search, WCAG 2 ratio, APCA Lc),
  none estimated.
- **Brand anchors (from the user):** coral `#FC6250`, blue `#1E6E91`.

## Status (2026-11-16)

**Phase A built.** The user accepted the recommendations for decisions 1–6: both 500s pinned; primitives
named by hue (`coral`, `blue`, `gray`, `red`, `green`); blue is the accent and coral the highlight; danger
is the crimson red ramp; the gradient keeps today's sRGB look; text/muted merged into text/secondary (the
name stays until Phase B). Decision 7 (Phase B rename): the user approved it; built below.

- `content/colors.js`: the five ramps as primitives (`--credo-<hue>-<step>`), every role pointing at a step.
  Values were rounded to three decimals with chroma rounded down so every step stays inside sRGB, which moved
  some hexes by 1–2 per channel; the tables below show the final values.
- `tests/color-ramps.test.mjs`: 10 tests for the ramp rules and contrast; 56 tests pass in total.
- Colors page: a Ramps section above the roles; each role shows its step.
- Checked in the browser: the Colors page, China, Automatic orders and Auto lombard render with the new
  values and no console errors.

**Phase B built (2026-11-16).** The user approved the rename ("Yes, rename the roles").

Rename map (old → new; CSS is `--credo-color-` plus the name with `/` as `-`):

| Old | New |
| --- | --- |
| surface/canvas, surface/tray | bg/page, bg/surface |
| surface/quiet, feedback/pending/fill | bg/subtle |
| overlay/scrim | bg/overlay |
| line/divider | border/separator |
| border/select, border/control | border/default, border/strong |
| border/selected | highlight/border |
| text/muted | text/secondary (merged) |
| text/placeholder | text/disabled |
| action/primary/label | text/on-accent |
| feedback/pending/icon | icon/secondary |
| action/secondary-button/fill | accent/subtle |
| surface/leading | accent/subtle-strong |
| action/primary/start | accent/solid |
| icon/leading, action/secondary-button/label | accent/text |
| action/primary/end, action/secondary/label | highlight/solid, highlight/text |
| feedback/success/fill, badge/fast/fill | success/subtle |
| feedback/success/action, badge/fast/label | success/solid, success/text |
| feedback/error/fill, /icon, /text | danger/subtle, danger/icon, danger/text |
| product/* | category/* (categorical palette, still Proposed) |
| action/primary/fill | button/primary/bg (component tier: the gradient) |
| action/secondary/gradient | inline-action/text (component tier: the gradient text) |

Unchanged: border/subtle, border/focus, text/strong, text/primary, text/secondary, icon/secondary.

- 193 references renamed across CSS, JSX, lib and tests; tests that matched name fragments updated too.
- Loose hex: 16 stale `var(--credo-color-…, #hex)` fallbacks removed (every consumer applies the tokens, and
  several held pre-ramp values such as `#707070`). White text on solid fills in ListRow, OptionCard,
  UploadSlot and the auto lombard product cards now uses text/on-accent. China's add/back icons use
  accent/text.
- **One visible change:** China's success status icon moved from loose `#40995B` on `#EAF6ED` to
  success/solid `#2E734B` on success/subtle `#DFECE3` (darker green, matching failure and pending, which
  already used roles). **User decision (2026-11-16): keep it.**
- **Left as is (not product UI or no role):** lab chrome (stages, tune panels, focus rings), the iPhone frame,
  card art, the China home screen copied from Figma (`transfer-home.css`), Loyalty and My space, and China's
  processing spinner (`#F1EEED` track, `#FA6255` arc: no coral role at that step).
- **border/strong has no user:** checkboxes use the round SelectMark (border/default). Kept as the 3:1 outline.
- Case-study notes keep the names they were written with; this table translates them.
- Checked: 56 tests pass, the build passes, and on the Colors page, China, Automatic orders and Auto lombard
  every `--credo-color-*` referenced by the loaded stylesheets resolves.

**Category colours (2026-11-17, user approved).** The product cards moved onto the ramps at one
lightness (~0.51): ink gray-900, blue blue-500, green green-500, coral coral-700, plus two single
colours, violet `#6E4EB3` (replaces orange) and teal `#277469` (both tuned once by the user). White text reaches 4.5:1 on every card
(test raised from 3:1). Details are in the auto lombard case study.
On 2026-11-17 the user asked to put them on the ramps too: violet and teal are now full 11-step ramps,
with the card colours pinned at 500 on the blue ramp's lightness curve. Every category role points at a
ramp step; the only plain values left are white and the black overlay. 58 tests pass.

## What is wrong today (findings)

| Severity | Finding | Where |
| --- | --- | --- |
| HIGH | Errors use the brand's coral (hue within 2° of `#FC6250`), so an error reads like a brand accent, and the Edit link (coral) looks like an error. A semantic colour used against its meaning. | `feedback/error/*`, `action/secondary/label` in `content/colors.js` |
| MEDIUM | No ramps: about 40 roles are raw hex picked by hand, including off-ramp brand shades (`#B84239`, `#AC382E`, `#D55045`, `#B3261E`, `#E6F1F5`, `#F4F8F9`). | `content/colors.js` |
| MEDIUM | Near-duplicate grays: `#707070` / `#808080` / `#818181`, `#F4F4F4` / `#F7F7F7`, `#646464` / `#707070`. | `content/colors.js` |
| MEDIUM | Mixed vocabulary in the semantic tier: `surface/` and `line/` beside `border/`, components and hues in role names (`action/secondary-button/fill`, `badge/fast/*`, `product/blue`). | `content/colors.js`, ~200 references |
| MEDIUM | Loose hex in component and study CSS (`#3a9ec9`, `#fa6255`, `#fc6859`, `#666`, `#ccc`, `#f6f9fb` …). | component and study CSS |
| LOW | The primary button gradient (blue → coral, opposite hues) interpolates in sRGB and passes a grey-mauve middle (`#66545F`, chroma 0.029). | `content/colors.js` `action/primary/fill` |
| LOW | Two interactive colours: inline actions (Edit) are coral while every other interactive element is blue. | Edit links vs secondary button, icons, focus |

## The brand colours

| Colour | Hex | OKLCH | Share of max chroma | White on it | On white |
| --- | --- | --- | --- | --- | --- |
| Coral | `#FC6250` | `oklch(0.692 0.192 29.48)` | 96% | 3.00:1 · Lc 61 | 3.00:1 · Lc 56 |
| Blue | `#1E6E91` | `oklch(0.508 0.092 232.094)` | 89% | 5.68:1 · Lc 83 | 5.68:1 · Lc 78 |

They pair well unchanged: hues 203° apart, both near their gamut limit. Coral is lighter (0.692 vs 0.508),
so white text fails on coral 500; **coral 700 (L 0.511) matches blue 500 (L 0.508)** and carries white
labels at 6.18:1. Per better-colors, a brand colour that fails behind white text stays the brand step, and
fills use a darker step; the brand is never quietly darkened. **Both 500s stay exact (pinned).**

## Structure (better-colors)

- **Two tiers.** Primitives are named by hue and step (`--credo-coral-500`) and are never used in
  components. Semantic tokens are named by role (`--credo-color-accent-solid`) and are the only tier
  components read.
- **Ramps:** one neutral (`gray`), the brand (`blue` as accent, `coral` as highlight, see decision 3), and
  only the status ramps Credo renders: `red` for danger, `green` for success. Pending stays gray. No warning
  or info ramp, because nothing shows those states.
- **11 steps, 50–950** (the user asked for about 10 per colour). Steps no role uses yet are kept as
  reserved primitives; better-colors prefers skipping them, but the full ramp is the user's request.

## How the ramps are built

1. One hue per ramp, constant end to end (rendered spread under 2°; better-colors and oklch-skill limit 10°).
2. 500 is the brand colour, exactly (pinned).
3. **Light end in fine steps** (better-colors: 0.04–0.05 apart): L 0.975, 0.93, 0.885, 0.82 for every
   ramp. 400 sits halfway to 500; 600–950 are evenly spaced from 500 down to L 0.24. No adjacent pair is
   under 0.03 apart.
4. **Vividness peaks at 500 and never exceeds it**, falling off at both ends, clamped to sRGB per step.
   (oklch-skill's constant share of max chroma was tried first and rejected: it turns coral 600–800 into
   neon red `#ED1B10` and blue 100–300 into sky cyan `#60C6F7`.)
5. **Gray is neutral** (chroma 0) and keeps Credo's existing grays where they fit.
6. **Status hues sit at least 15° from the accent hues** (better-colors). Danger moves from coral's 29.5° to
   14.5°, a crimson red; success is green at 155°.

Known unevenness from pinning: blue and green step 0.156–0.160 between 300, 400 and 500 (their brand
values are dark). better-colors accepts this for a pinned brand colour.

## The ramps

### Coral (hue 29.48) — brand highlight

| Step | OKLCH | Hex | White on it | On white |
| --- | --- | --- | --- | --- |
| 50 | `oklch(0.975 0.012 29.48)` | `#FFF4F2` | 1.08 | 1.08 |
| 100 | `oklch(0.93 0.035 29.48)` | `#FFE0DA` | 1.24 | 1.24 |
| 200 | `oklch(0.885 0.06 29.48)` | `#FECBC2` | 1.44 | 1.44 |
| 300 | `oklch(0.82 0.101 29.48)` | `#FFAB9E` | 1.81 | 1.81 |
| 400 | `oklch(0.756 0.146 29.48)` | `#FF8978` | 2.31 | 2.31 |
| **500** | `oklch(0.692 0.192 29.48)` | `#FC6250` | 3.00 | 3.00 |
| 600 | `oklch(0.601 0.172 29.48)` | `#D34D3E` | 4.26 | 4.26 |
| 700 | `oklch(0.511 0.153 29.48)` | `#AD392D` | 6.18 | 6.18 |
| 800 | `oklch(0.421 0.13 29.48)` | `#86281E` | 8.99 | 8.99 |
| 900 | `oklch(0.33 0.105 29.48)` | `#601811` | 12.84 | 12.84 |
| 950 | `oklch(0.24 0.076 29.48)` | `#3C0C07` | 16.83 | 16.83 |

### Blue (hue 232.094) — brand accent

| Step | OKLCH | Hex | White on it | On white |
| --- | --- | --- | --- | --- |
| 50 | `oklch(0.975 0.007 232.094)` | `#F2F8FB` | 1.07 | 1.07 |
| 100 | `oklch(0.93 0.018 232.094)` | `#DDEAF2` | 1.23 | 1.23 |
| 200 | `oklch(0.885 0.036 232.094)` | `#C2DEED` | 1.40 | 1.40 |
| 300 | `oklch(0.82 0.059 232.094)` | `#9ECCE4` | 1.72 | 1.72 |
| 400 | `oklch(0.664 0.078 232.094)` | `#609CBB` | 3.02 | 3.02 |
| **500** | `oklch(0.508 0.092 232.094)` | `#1E6E91` | 5.68 | 5.68 |
| 600 | `oklch(0.454 0.083 232.094)` | `#175E7C` | 7.16 | 7.16 |
| 700 | `oklch(0.401 0.073 232.094)` | `#134E68` | 9.06 | 9.06 |
| 800 | `oklch(0.347 0.062 232.094)` | `#0F3F54` | 11.29 | 11.29 |
| 900 | `oklch(0.294 0.05 232.094)` | `#0C3041` | 13.86 | 13.86 |
| 950 | `oklch(0.24 0.036 232.094)` | `#0B222D` | 16.39 | 16.39 |

### Gray (neutral)

| Step | OKLCH | Hex | On white |
| --- | --- | --- | --- |
| 50 | `oklch(0.976 0 0)` | `#F7F7F7` | 1.07 |
| 100 | `oklch(0.94 0 0)` | `#EBEBEB` | 1.19 |
| 200 | `oklch(0.908 0 0)` | `#E0E0E0` | 1.32 |
| 300 | `oklch(0.8 0 0)` | `#BEBEBE` | 1.86 |
| 400 | `oklch(0.7 0 0)` | `#9E9E9E` | 2.68 |
| 500 | `oklch(0.6 0 0)` | `#808080` | 3.95 |
| 600 | `oklch(0.508 0 0)` | `#656565` | 5.83 |
| 700 | `oklch(0.41 0 0)` | `#4A4A4A` | 8.86 |
| 800 | `oklch(0.33 0 0)` | `#353535` | 12.27 |
| 900 | `oklch(0.28 0 0)` | `#292929` | 14.55 |
| 950 | `oklch(0.205 0 0)` | `#171717` | 17.93 |

Gray 100 moves from `#EDEDED` to `#EBEBEB`: 50 and 100 were 0.029 apart, under better-colors' 0.03 minimum.

### Red (hue 14.48) — danger, 15° from the coral

| Step | OKLCH | Hex | White on it | On white |
| --- | --- | --- | --- | --- |
| 50 | `oklch(0.975 0.012 14.48)` | `#FFF4F4` | 1.08 | 1.08 |
| 100 | `oklch(0.93 0.035 14.48)` | `#FFDFE0` | 1.24 | 1.24 |
| 200 | `oklch(0.885 0.061 14.48)` | `#FFC9CD` | 1.45 | 1.45 |
| 300 | `oklch(0.82 0.102 14.48)` | `#FFA9AF` | 1.82 | 1.82 |
| 400 | `oklch(0.72 0.176 14.48)` | `#FF6E82` | 2.69 | 2.69 |
| 500 | `oklch(0.62 0.237 14.48)` | `#F31C58` | 4.11 | 4.11 |
| 600 | `oklch(0.544 0.214 14.48)` | `#CE0A47` | 5.59 | 5.59 |
| 700 | `oklch(0.468 0.187 14.48)` | `#A90038` | 7.65 | 7.65 |
| 800 | `oklch(0.392 0.156 14.48)` | `#85012A` | 10.34 | 10.34 |
| 900 | `oklch(0.316 0.126 14.48)` | `#62001D` | 13.66 | 13.66 |
| 950 | `oklch(0.24 0.095 14.48)` | `#410110` | 17.04 | 17.04 |

### Green (hue 155.2) — success, from today's `#2E734B`

| Step | OKLCH | Hex | White on it | On white |
| --- | --- | --- | --- | --- |
| 50 | `oklch(0.975 0.007 155.206)` | `#F3F8F5` | 1.07 | 1.07 |
| 100 | `oklch(0.93 0.018 155.206)` | `#DFECE3` | 1.22 | 1.22 |
| 200 | `oklch(0.885 0.037 155.206)` | `#C7E1CF` | 1.39 | 1.39 |
| 300 | `oklch(0.82 0.061 155.206)` | `#A5D0B3` | 1.70 | 1.70 |
| 400 | `oklch(0.66 0.08 155.206)` | `#69A17D` | 3.00 | 3.00 |
| **500** | `oklch(0.5 0.095 155.206)` | `#2E734B` | 5.72 | 5.72 |
| 600 | `oklch(0.448 0.085 155.206)` | `#266240` | 7.15 | 7.15 |
| 700 | `oklch(0.396 0.075 155.206)` | `#1F5235` | 9.08 | 9.08 |
| 800 | `oklch(0.344 0.064 155.206)` | `#19432A` | 11.20 | 11.20 |
| 900 | `oklch(0.292 0.052 155.206)` | `#133320` | 13.80 | 13.80 |
| 950 | `oklch(0.24 0.037 155.206)` | `#102417` | 16.19 | 16.19 |

## Roles mapped to ramps

Phase A changes only values (roles point at steps, names stay, no component edits). The "Phase B name"
column is the better-colors grammar for the optional rename.

| Role today | Phase B name | Before | After | ΔL |
| --- | --- | --- | --- | --- |
| surface/canvas, surface/tray | bg-page, bg-surface | `#FFFFFF` | white | 0 |
| surface/quiet | bg-subtle | `#F7F7F7` | gray-50 `#F7F7F7` | 0 |
| line/divider | border-separator | `#F7F7F7` | gray-50 `#F7F7F7` | 0 |
| border/subtle | border-subtle | `#EDEDED` | gray-100 `#EBEBEB` | −0.006 |
| border/select | border-default | `#E0E0E0` | gray-200 `#E0E0E0` | 0 |
| border/control | border-strong | `#808080` | gray-500 `#808080` | 0 |
| icon/secondary, feedback/pending/icon | icon-secondary | `#808080`, `#818181` | gray-500 `#808080` | 0 / −0.003 |
| text/placeholder | text-disabled | `#BDBDBD` | gray-300 `#BEBEBE` | +0.003 |
| text/secondary | text-secondary | `#646464` | gray-600 `#656565` | +0.004 |
| text/muted | text-secondary (merged) | `#707070` | gray-600 `#656565` (4.95 → 5.83:1) | −0.038 |
| text/primary | text-primary | `#292929` | gray-900 `#292929` | 0 |
| text/strong | text-strong | `#171717` | gray-950 `#171717` | 0 |
| feedback/pending/fill | bg-subtle | `#F4F4F4` | gray-50 `#F7F7F7` | +0.009 |
| action/secondary-button/fill | accent-subtle | `#F4F8F9` | blue-50 `#F2F8FB` | −0.001 |
| surface/leading | accent-subtle-strong | `#E6F1F5` | blue-100 `#DDEAF2` | −0.022 |
| action/primary/start | accent-solid | `#1E6E91` | blue-500 | 0 |
| icon/leading, action/secondary-button/label | accent-text | `#1E6E91` | blue-500 | 0 |
| border/focus | border-focus | `#1E6E91` | blue-500 | 0 |
| action/primary/end | highlight-solid | `#B84239` | coral-700 `#AD392D` (white 6.18:1) | −0.031 |
| action/secondary/label (Edit) | highlight-text | `#AC382E` | coral-700 `#AD392D` | +0.003 |
| border/selected | highlight-border | `#D55045` | coral-600 `#D34D3E` | −0.006 |
| feedback/error/fill | danger-subtle | `#FFF1EF` | red-50 `#FFF4F4` | +0.007 |
| feedback/error/icon | danger-icon | `#ED594E` | red-500 `#F31C58` (4.11:1, icons need 3:1) | −0.037 |
| feedback/error/text | danger-text | `#B3261E` | red-700 `#A90038` (7.65:1) | −0.034 |
| feedback/success/fill, badge/fast/fill | success-subtle | `#E2F3E6`, `#DFF9E0` | green-100 `#DFECE3` | −0.018 / −0.027 |
| feedback/success/action | success-solid | `#2E734B` | green-500 `#2E734B` | 0 |
| badge/fast/label | success-text | `#046D1A` | green-600 `#266240` (7.15:1) | −0.016 |

The only visible change is the error colour (coral → crimson, hue −14°). Everything else moves at most 0.038
in lightness.

## Gradient (primary button)

Blue 500 → coral 700 are opposite hues, so the middle passes near grey. Measured middles:

| Space | Middle | White label |
| --- | --- | --- |
| sRGB (today) | `#66545F`, chroma 0.029 | 7.00:1 |
| `in oklab` | `#795D64`, chroma 0.038 | 5.89:1 |
| `in oklch` (shorter hue) | `#7C4F99`, chroma 0.122, a purple middle | 6.11:1 |

All pass for the white label. better-colors treats the space as a look, not a defect.

## Build

**Phase A — values (no component changes)**
1. `content/colors.js`: add five ramps as primitives (`--credo-coral-50` … `--credo-gray-950`, OKLCH exactly
   as above). Each existing role points at a step; hex kept beside it for the tests.
2. Tests: 500s equal the brand exactly; hue spread under 10° per ramp; chroma never above the 500's; every
   step inside sRGB; light-end gaps 0.04–0.05; no adjacent gap under 0.03; danger at least 15° from coral;
   text roles at least 4.5:1 on white; white on both button ends at least 4.5:1; UI outlines and icons at
   least 3:1.
3. Colors page: the ramps (step, OKLCH, hex, contrast) above the roles.
4. Browser check of China, Automatic orders and Auto lombard: only the listed changes.

**Phase B — semantic rename (optional, needs approval)**
Rename roles to the better-colors grammar (`--credo-color-{bg|text|border}-…`,
`--credo-color-{accent|highlight|danger|success}-{subtle|border|solid|text}`) across ~200 references,
mechanically, one commit-sized step; then replace the loose hex in component CSS with roles.

**Later:** the six `product/*` card colours (convert to OKLCH; decide whether they are a category palette).

## Decisions for the user

1. **Pin both 500s exactly** (recommended), or adjust them?
2. **Primitive names by hue:** `coral`, `blue`, `gray`, `red`, `green` (not `primary` / `secondary`, which
   collide with `text-primary`). OK?
3. **Brand roles:** blue is the **accent** (interactive, selected, focus) and coral the **highlight** (the
   main button's end, Edit, selected ring)? Or make every interactive text blue, leaving coral only in the
   main button (fixes the two-interactive-colours finding)?
4. **Danger as crimson** (hue 14.5°, recommended: errors stop looking like the brand), or keep errors in
   the brand coral and mark destructive actions with an icon and an outlined treatment instead?
5. **Gradient:** keep today's look (recommended; it's a brand look, not a defect), or `in oklch` for a
   purple middle?
6. **Merge text/muted into text/secondary** (recommended)?
7. **Phase B rename:** do it after Phase A, or keep today's role names?
