// Tray spacing check (phase 4, 2026-11-14). Paste into the browser console on
// /studies/automatic-orders or /studies/transfers with a tray open, or run it
// from a browser tool. It measures the step that is showing, in tray points
// (the phone frame's scale is removed), to what you see: an icon, a field's
// fill, the top of the letters (line box minus half-leading).
// Expected (content/spacing.mjs): top 16 (big-number steps excepted),
// titleVsX 0, xRight 24, divider 24 from the edge, button 34 from the bottom.
(() => {
  const china = document.querySelector('.transfer-phone');
  const frame = china || document.querySelector('.ao-phone');
  if (!frame) return 'Open /studies/automatic-orders or /studies/transfers first.';
  const scale = china ? china.getBoundingClientRect().width / 390 : document.querySelector('.ap-holder').getBoundingClientRect().width / 414;
  const textOf = el => [...el.childNodes].some(node => node.nodeType === 3 && node.textContent.trim());
  const visible = el => {
    if (!el.getBoundingClientRect().height) return false;
    for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.visibility === 'hidden' || Number(style.opacity) < .5) return false;
    }
    return true;
  };
  // Something you can see: an image, a fill, a border or text.
  const shown = el => {
    if (!visible(el)) return false;
    const style = getComputedStyle(el);
    return el.tagName === 'IMG' || el.tagName === 'svg' || style.backgroundColor !== 'rgba(0, 0, 0, 0)' || style.backgroundImage !== 'none' || parseFloat(style.borderTopWidth) > 0 || textOf(el);
  };
  const half = el => { const s = getComputedStyle(el); return (parseFloat(s.lineHeight) - parseFloat(s.fontSize)) / 2 * scale; };
  const top = el => el.getBoundingClientRect().top + (textOf(el) ? half(el) : 0);
  const bottom = el => el.getBoundingClientRect().bottom - (textOf(el) ? half(el) : 0);
  const pt = value => Math.round(value / scale * 10) / 10;

  const surface = document.querySelector(china ? '.transfer-sheet' : '.ao-surface').getBoundingClientRect();
  const divider = (china ? document.querySelector('.transfer-divider') : document.querySelector('.ao-head__divider')).getBoundingClientRect();
  const button = [...document.querySelectorAll(china ? '.transfer-primary' : '.ao-footer[data-shown] .ao-action')].find(visible);
  const scope = china ? [...document.querySelectorAll('.transfer-sheet *')].filter(el => !el.closest('.transfer-sheet-header, .transfer-divider, .transfer-feather, .transfer-primary'))
    : [...document.querySelector('.ao-layer[data-phase=in], .ao-layer[data-phase=rest], .ao-layer[data-phase=idle]').querySelectorAll('*')];
  const content = scope.filter(el => shown(el) && top(el) > divider.bottom - 2 && (!button || bottom(el) < button.getBoundingClientRect().top));
  const first = content.reduce((a, el) => top(el) < top(a) ? el : a);
  const last = content.reduce((a, el) => bottom(el) > bottom(a) ? el : a);
  const title = [...document.querySelectorAll(china ? '.transfer-sheet-titles > span' : '.ao-head__title')].find(el => Number(getComputedStyle(el).opacity) > .5).getBoundingClientRect();
  const close = [...document.querySelectorAll(china ? '.transfer-sheet .credo-tray__icon-button' : '.ao-close')].find(visible).getBoundingClientRect();
  return {
    step: china ? document.querySelector('.transfer-panel:not([inert])')?.dataset.panel : document.querySelector('.ao-layer[data-phase=in], .ao-layer[data-phase=rest], .ao-layer[data-phase=idle]').dataset.step,
    top: pt(top(first) - divider.bottom),
    toButton: button ? pt(button.getBoundingClientRect().top - bottom(last)) : null,
    buttonBottom: button ? pt(surface.bottom - button.getBoundingClientRect().bottom) : null,
    titleVsX: pt((title.top + title.bottom) / 2 - (close.top + close.bottom) / 2),
    xRight: pt(surface.right - close.right),
    // China draws its divider line with ::after, inset by the gutter.
    dividerLeft: china ? parseFloat(getComputedStyle(document.querySelector('.transfer-divider'), '::after').left) : pt(divider.left - surface.left)
  };
})();
