'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { amountToMinor, formatAmount } from '../../../lib/transfer-flow.mjs';
import { ACCOUNTS, AGREEMENTS, CATEGORIES, INITIAL_TEMPLATES, MONTHLY_FEE, OTP, PROVIDERS, RULES, TITLES, dateCopy, digits, queryProviders } from './data.mjs';
import { Field, Icon, Identity, Mark, Row, ValueRow } from './UI';
import CredoRule from './CredoRule';
import FamilyRule from './FamilyRule';
import AaveRule from './AaveRule';
import CalendarPicker from './CalendarPicker';

const EASE = 'cubic-bezier(.22,.78,.18,1)';
const STATUS_ICONS = ['cellular', 'wifi', 'battery'];

function SheetPicker({ variant, templates, onTemplate, onProvider, pathChanged }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [browsing, setBrowsing] = useState(variant !== 'family');
  const [tab, setTab] = useState('providers');
  const searchRef = useRef(null);
  const matched = queryProviders(query, category);
  const categoryName = CATEGORIES.find(item => item.id === category)?.name;
  const activeQuery = Boolean(query.trim());
  const isAave = variant === 'aave';
  const showCategories = !activeQuery && !category;
  const categories = CATEGORIES.map(item => <Row key={item.id} icon={item.icon} tone={item.tone} title={item.name} onClick={() => {
    pathChanged(); setCategory(item.id);
  }} />);
  const templateRows = templates.map(template => {
    const provider = PROVIDERS.find(item => item.id === template.provider);
    return <Row key={`${template.provider}-${template.number}`} icon={provider.icon} tone={provider.tone} title={template.label}
      subtitle={`${provider.name} · ${template.number}`} onClick={() => onTemplate(template)} />;
  });

  function backToCategories() {
    pathChanged(); setQuery(''); setCategory(null); searchRef.current?.focus({ preventScroll: true });
  }

  return <div className="pp-picker">
    {isAave && <div className="pp-picker-tabs">
      <button type="button" aria-pressed={tab === 'providers'} onClick={() => { pathChanged(); setTab('providers'); }}>მომსახურებები</button>
      <button type="button" aria-pressed={tab === 'templates'} onClick={() => { pathChanged(); setTab('templates'); }}>შაბლონები</button>
    </div>}
    {!isAave && !activeQuery && !category && <section className="pp-list-section">
      <h3 className="pp-section-title">შენახული შაბლონები</h3><div className="pp-list">{templateRows}</div>
    </section>}
    {!browsing && <Row className="pp-browse-entry" icon="search" title="მომსახურების მოძებნა"
      onClick={() => { pathChanged(); setBrowsing(true); }} />}
    {isAave && tab === 'templates' && <div className="pp-list">{templateRows}</div>}
    {browsing && (!isAave || tab === 'providers') && <section className="pp-list-section">
      <div className="pp-search">
        <Icon name="search" size={18} />
        <input ref={searchRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="მოძებნე პროვაიდერი" aria-label="მოძებნე პროვაიდერი" />
        {query && <button type="button" className="pp-clear" aria-label="ძიების გასუფთავება" onClick={() => { setQuery(''); searchRef.current.focus(); }}><Icon name="close" size={17} /></button>}
      </div>
      {showCategories && <><h3 className="pp-section-title">კატეგორიები</h3><div className="pp-list pp-categories">{categories}</div></>}
      {!showCategories && <>
        {category && !activeQuery && <button type="button" className="pp-text-button pp-category-back" onClick={backToCategories}><Icon name="back" size={16} />{categoryName}</button>}
        {matched.length > 0 ? <div className="pp-list">{matched.map(provider => <Row key={provider.id} icon={provider.icon} tone={provider.tone} title={provider.name}
          onClick={() => onProvider(provider)} />)}</div> : <p className="pp-empty-result" role="status">პროვაიდერი ვერ მოიძებნა</p>}
      </>}
    </section>}
    {browsing && variant === 'family' && <button type="button" className="pp-text-button" onClick={() => {
      pathChanged(); setBrowsing(false); setCategory(null); setQuery('');
    }}>შაბლონებზე დაბრუნება</button>}
  </div>;
}

function Summary({ rule, account, editRule, editAccount }) {
  const { kind, day, amount } = rule;
  return <div className="pp-summary">
    <ValueRow label="გადახდის წესი" value={RULES[kind].short} onClick={editRule} />
    {kind === 'monthly' && <ValueRow label="გადახდის დღე" value={dateCopy(day)} />}
    <ValueRow label={kind === 'bill' ? 'მაქსიმალური თანხა' : 'თანხა'} value={`${formatAmount(amountToMinor(amount))} ₾`} />
    <ValueRow label="ჩამოსაჭრელი ანგარიში" value={`•• ${account.suffix}`} onClick={editAccount} />
    <ValueRow label="ყოველთვიური საფასური" value={MONTHLY_FEE} />
  </div>;
}

export default function PaymentFlow({ variant, statusAssets }) {
  const [trail, setTrail] = useState(['picker']);
  const [provider, setProvider] = useState(null);
  const [number, setNumber] = useState('');
  const [inputNumber, setInputNumber] = useState('');
  const [numberError, setNumberError] = useState('');
  const [kind, setKind] = useState(null);
  const [amounts, setAmounts] = useState({ bill: '', monthly: '' });
  const [day, setDay] = useState(null);
  const [pendingDay, setPendingDay] = useState(1);
  const [accountId, setAccountId] = useState('main');
  const [consents, setConsents] = useState([false, false]);
  const [term, setTerm] = useState(0);
  const [otp, setOtp] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [rules, setRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [layoutChange, setLayoutChange] = useState(0);
  const sheet = useRef(null);
  const surface = useRef(null);
  const header = useRef(null);
  const scene = useRef(null);
  const scroll = useRef(null);
  const opener = useRef(null);
  const previousTop = useRef(null);
  const motion = useRef([]);
  const direction = useRef(1);
  const view = trail.at(-1);
  const open = Boolean(view);
  const family = variant === 'family';
  const aave = variant === 'aave';
  const amount = amounts[kind] || '';
  const account = ACCOUNTS.find(item => item.id === accountId);
  const valid = Boolean(kind && amountToMinor(amount) && (kind === 'bill' || day));
  const subscriberName = provider?.subscriber;
  const ruleDraft = { provider, number, subscriberName, kind, day, amount, account };
  const isEditingReview = trail.slice(0, -1).includes('review');
  const activeRule = view === 'details' ? selectedRule : ruleDraft;
  const activeAccount = view === 'details' ? activeRule?.account : account;

  function capturePosition(nextDirection = 1) {
    previousTop.current = surface.current?.getBoundingClientRect().top ?? null;
    direction.current = nextDirection;
  }
  function changeLayout() {
    capturePosition();
    setLayoutChange(value => value + 1);
  }
  function go(next) {
    capturePosition();
    setTrail(steps => [...steps, next]);
  }
  function back() {
    if (trail.length === 1) { close(); return; }
    capturePosition(-1);
    setTrail(steps => steps.slice(0, -1));
  }
  function close() {
    motion.current.forEach(animation => animation.cancel());
    previousTop.current = null;
    setTrail([]);
  }
  function begin() {
    setProvider(null); setNumber(''); setInputNumber(''); setNumberError(''); setKind(null);
    setAmounts({ bill: '', monthly: '' }); setDay(null); setAccountId('main');
    setConsents([false, false]); setOtp(''); setOtpMessage('');
    setSelectedRule(null); go('picker');
  }

  useLayoutEffect(() => {
    if (!view) { opener.current?.focus({ preventScroll: true }); return; }
    sheet.current.focus({ preventScroll: true });
    scroll.current.scrollTop = 0;
  }, [view]);

  useLayoutEffect(() => {
    if (!view) return;
    const was = previousTop.current;
    previousTop.current = null;
    motion.current.forEach(animation => animation.cancel());
    motion.current = [];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const delta = was === null ? (view === 'picker' ? 80 : 0) : was - surface.current.getBoundingClientRect().top;
    if (was === null && view === 'picker') {
      motion.current.push(sheet.current.animate(
        [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }],
        { duration: 260, easing: EASE }
      ));
      return () => { motion.current.forEach(animation => animation.cancel()); };
    }
    if (Math.abs(delta) > 1) {
      const distance = Math.min(Math.max(delta, -540), 540);
      const frames = [{ transform: `translateY(${distance}px)` }, { transform: 'translateY(0)' }];
      const timing = { duration: family ? 255 : aave ? 240 : 230, easing: EASE };
      motion.current.push(surface.current.animate(frames, timing));
      if (was !== null) motion.current.push(header.current.animate(frames, timing));
    }
    const shift = direction.current * (family ? 12 : 7);
    const transform = family ? `translateY(${shift}px) scale(.986)` : aave ? `translateX(${shift}px)` : `translateY(${shift}px)`;
    motion.current.push(scene.current.animate([{ opacity: .15, transform }, { opacity: 1, transform: 'none' }],
      { duration: family ? 195 : 160, easing: EASE }));
    return () => { motion.current.forEach(animation => animation.cancel()); };
  }, [view, layoutChange, family, aave]);

  function resetRule() {
    setKind(null); setAmounts({ bill: '', monthly: '' }); setDay(null); setAccountId('main');
    setConsents([false, false]);
  }
  function useProvider(item) {
    if (provider?.id !== item.id) resetRule();
    setProvider(item); setNumber(''); setInputNumber(''); setNumberError(''); go('subscriber');
  }
  function useTemplate(template) {
    const item = PROVIDERS.find(service => service.id === template.provider);
    if (provider?.id !== item.id || number !== template.number) resetRule();
    setProvider(item); setNumber(template.number); setInputNumber(template.number); go('rule');
  }
  function editNumber() {
    setInputNumber(number); setNumberError(''); go('subscriber');
  }
  function lookup() {
    if (inputNumber.length < 6) return;
    if (inputNumber !== provider.demo) {
      setNumberError('აბონენტი ვერ მოიძებნა. შეამოწმე ნომერი.');
      return;
    }
    setNumber(inputNumber);
    if (trail.at(-2) !== 'picker') { setConsents([false, false]); back(); }
    else go('rule');
  }
  function choose(next) {
    if (kind !== next) setConsents([false, false]);
    if (family) { setKind(next); go('amount'); }
    else if (kind !== next) { changeLayout(); setKind(next); }
  }
  function changeAmount(value) {
    const clean = value.replace(',', '.');
    if (/^\d{0,6}(\.\d{0,2})?$/.test(clean)) {
      setAmounts(current => ({ ...current, [kind]: clean.startsWith('.') ? `0${clean}` : clean }));
      setConsents([false, false]);
    }
  }
  function openCalendar() {
    setPendingDay(day || 1); go('calendar');
  }
  function saveDay() {
    setDay(pendingDay); setConsents([false, false]); back();
  }
  function review() {
    if (!valid) return;
    if (isEditingReview) {
      capturePosition(-1);
      setTrail(steps => steps.slice(0, steps.indexOf('review') + 1));
    } else go('review');
  }
  function checkOtp() {
    if (otp.length !== OTP.length) return;
    if (otp !== OTP) { setOtpMessage('კოდი არასწორია. სცადე ხელახლა.'); return; }
    setRules(current => [{ ...ruleDraft, id: current.length + 1 }, ...current]);
    go('success');
  }
  function toggleConsent(index, value) {
    setConsents(current => current.map((accepted, slot) => slot === index ? value : accepted));
  }
  function saveTemplate() {
    setTemplates(current => [...current, { provider: provider.id, number, label: provider.name }]);
  }
  function onDialogKey(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (view === 'success') close(); else back();
    }
    if (event.key === 'Tab') {
      const controls = [...sheet.current.querySelectorAll('button:not(:disabled), input:not(:disabled)')].filter(node => node.getClientRects().length);
      if (!controls.length) return;
      if (event.shiftKey && (event.target === sheet.current || event.target === controls[0])) {
        event.preventDefault(); controls.at(-1).focus();
      } else if (!event.shiftKey && event.target === controls.at(-1)) {
        event.preventDefault(); controls[0].focus();
      }
    }
  }

  const identity = provider && number && <Identity provider={provider} name={subscriberName} number={number} edit={editNumber} />;
  const isMonthly = kind === 'monthly';
  const amountLabel = isMonthly ? 'გადასახდელი თანხა' : 'მაქსიმალური თანხა';
  const amountField = <Field label={amountLabel} value={amount} onChange={changeAmount} onSubmit={review} inputMode="decimal" placeholder="0.00" suffix="₾" />;
  const dateField = <Row className="pp-date-row" icon="calendar" title={day ? dateCopy(day) : 'აირჩიე გადახდის დღე'} onClick={openCalendar} />;
  const limitHelp = <p className="pp-limit-help">{amountToMinor(amount)
    ? `თუ დავალიანება ${formatAmount(amountToMinor(amount))} ₾-ს გადააჭარბებს, თანხა არ ჩამოიჭრება.`
    : 'თუ დავალიანება ლიმიტს გადააჭარბებს, თანხა არ ჩამოიჭრება.'}</p>;
  const fields = <>{amountField}{isMonthly ? dateField : limitHelp}</>;
  const aaveFields = <>
    <label className="pp-amount-hero">
      <span>{kind ? amountLabel : 'გადახდის თანხა'}</span>
      <span className="pp-large-value" style={{ "--digit-size": amount.length > 6 ? "42px" : amount.length > 4 ? "52px" : "64px" }}><input aria-label={kind ? amountLabel : 'გადახდის თანხა'} placeholder="0" value={amount}
        disabled={!kind} inputMode="decimal" onChange={event => changeAmount(event.target.value)}
        onKeyDown={event => { if (event.key === 'Enter') review(); }} /><b>₾</b></span>
    </label>
    {kind && !isMonthly && limitHelp}
  </>;

  let content;
  let action;
  switch (view) {
    case 'picker':
      content = <SheetPicker variant={variant} templates={templates} onTemplate={useTemplate} onProvider={useProvider} pathChanged={changeLayout} />;
      break;
    case 'subscriber':
      content = <>
        <div className="pp-provider-heading"><Mark icon={provider.icon} tone={provider.tone} /><strong>{provider.name}</strong></div>
        <Field label="აბონენტის ნომერი" value={inputNumber} onChange={value => { setInputNumber(digits(value, 12)); setNumberError(''); }}
          onSubmit={lookup} placeholder={provider.demo} inputMode="numeric" error={numberError} />
        <button type="button" className="pp-text-button pp-demo" onClick={() => { setInputNumber(provider.demo); setNumberError(''); }}>
          სატესტო ნომრის გამოყენება
        </button>
      </>;
      action = ['შემოწმება', lookup, inputNumber.length < 6];
      break;
    case 'rule':
    case 'amount':
      content = <>
        {aave && <AaveRule kind={kind} choose={choose} fields={aaveFields} />}
        {!aave && !family && <CredoRule kind={kind} choose={choose} fields={fields} />}
        {family && <FamilyRule kind={kind} choose={choose} fields={fields} editing={view === 'amount'} />}
        {aave && kind && <div className="pp-aave-inline">
          {isMonthly && dateField}
          <Row icon="wallet" title={account.name} subtitle={`•• ${account.suffix}`} onClick={() => go('account')} />
        </div>}
      </>;
      if (!family || view === 'amount') action = ['გაგრძელება', review, !valid];
      break;
    case 'calendar':
      content = <CalendarPicker day={day || 1} onPick={setPendingDay} />;
      action = ['დღის არჩევა', saveDay];
      break;
    case 'account':
      content = <div className="pp-list pp-account-list">{ACCOUNTS.map(item => <Row key={item.id} icon="wallet" tone={item.tone} title={item.name}
        subtitle={`•• ${item.suffix} · ${item.balance}`} selected={item.id === accountId}
        onClick={() => { setAccountId(item.id); setConsents([false, false]); back(); }} />)}</div>;
      break;
    case 'review':
    case 'details':
      content = <>
        <Identity provider={activeRule.provider} number={activeRule.number} name={activeRule.subscriberName} edit={view === 'review' ? editNumber : undefined} />
        <Summary rule={activeRule} account={activeAccount} editRule={view === 'review' ? () => go('rule') : undefined}
          editAccount={view === 'review' ? () => go('account') : undefined} />
        {view === 'review' && <fieldset className="pp-consents">
          <legend>თანხმობები</legend>
          {AGREEMENTS.map((agreement, index) => <div className="pp-consent-row" key={agreement.title}>
            <input type="checkbox" checked={consents[index]} aria-label={agreement.title} onChange={event => toggleConsent(index, event.target.checked)} />
            <button type="button" onClick={() => { setTerm(index); go('terms'); }}>{agreement.title}<Icon name="next" size={15} /></button>
          </div>)}
        </fieldset>}
      </>;
      action = view === 'review'
        ? ['გააქტიურება', () => { setOtp(''); setOtpMessage(''); go('otp'); }, !consents.every(Boolean)]
        : ['დახურვა', close];
      break;
    case 'terms':
      content = <article className="pp-terms">
        <Mark icon="file" /><h3>{AGREEMENTS[term].title}</h3>
        {AGREEMENTS[term].paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        <button type="button" className="pp-text-button" onClick={() => { toggleConsent(term, false); back(); }}>არ ვეთანხმები</button>
      </article>;
      action = ['ვეთანხმები', () => { toggleConsent(term, true); back(); }];
      break;
    case 'otp':
      content = <div className="pp-otp">
        <Mark icon="lock" />
        <p>კოდი გაიგზავნა ნომერზე 5•• •• •• 21</p>
        <Field label="ერთჯერადი კოდი" value={otp} onChange={value => { setOtp(digits(value, 4)); setOtpMessage(''); }}
          onSubmit={checkOtp} placeholder="0000" inputMode="numeric" autocomplete="one-time-code" />
        <button type="button" className="pp-text-button pp-demo" onClick={() => { setOtp(OTP); setOtpMessage(''); }}>სატესტო კოდი {OTP}</button>
        <button type="button" className="pp-text-button" onClick={() => { setOtp(''); setOtpMessage('სატესტო კოდი ხელახლა გამოიგზავნა.'); }}>კოდის ხელახლა გაგზავნა</button>
        {otpMessage && <p className="pp-otp-message" role="status">{otpMessage}</p>}
      </div>;
      action = ['დადასტურება', checkOtp, otp.length !== OTP.length];
      break;
    case 'success': {
      const saved = templates.some(template => template.provider === provider.id && template.number === number);
      content = <div className="pp-success">
        <span className="pp-success-mark"><Icon name="check" size={37} /></span>
        <h3>ავტომატური გადახდა გააქტიურდა</h3>
        <p>{provider.name} · {number}</p>
        <div className="pp-success-rule">{kind === 'monthly' ? dateCopy(day) : RULES.bill.title}<strong>{formatAmount(amountToMinor(amount))} ₾</strong></div>
        {!saved && <button type="button" className="pp-text-button" onClick={saveTemplate}><Icon name="star" size={16} />შაბლონად შენახვა</button>}
      </div>;
      action = ['დასრულება', close];
      break;
    }
  }

  return <div className="pp-device" lang="ka">
    <div className="pp-screen">
      <div className="pp-status" aria-hidden="true"><b>9:41</b><span>{STATUS_ICONS.map(icon => <img key={icon} alt="" src={statusAssets?.[icon] ?? `/assets/transfers/${icon}.svg`} />)}</span></div>
      <div className="pp-background" inert={open}>
        <header className="pp-app-bar">{!statusAssets && <a href="/" aria-label="კვლევებზე დაბრუნება"><Icon name="back" /></a>}<span>MyCredo</span></header>
        <div className="pp-home-content">
          <span className="pp-home-mark"><Icon name="repeat" size={31} /></span>
          <h1>ავტომატური<br />გადახდები</h1>
          <p>დააყენე გადახდის წესი შენი გადასახადებისთვის.</p>
          <button type="button" className="pp-home-add" ref={opener} onClick={begin}><Icon name="plus" size={18} />გადახდის დამატება</button>
          {rules.length > 0 && <section className="pp-home-rules"><h2 className="pp-section-title">აქტიური გადახდები</h2>
            <div className="pp-list">{rules.map(item => <Row key={item.id} icon={item.provider.icon} tone={item.provider.tone} title={item.provider.name}
              subtitle={item.kind === 'monthly' ? dateCopy(item.day) : RULES.bill.title} onClick={() => { setSelectedRule(item); go('details'); }} />)}</div>
          </section>}
        </div>
      </div>
      {open && <>
        <div className="pp-scrim" aria-hidden="true" onClick={close} />
        <section ref={sheet} className="pp-sheet" data-view={view} role="dialog" aria-modal="true" aria-labelledby="pp-title" tabIndex={-1} onKeyDown={onDialogKey}>
          <div className="pp-sheet-surface" ref={surface} aria-hidden="true" />
          <header className="pp-sheet-header" ref={header}>
            {trail.length > 1 && view !== 'success' && <button type="button" className="pp-icon-button pp-back" aria-label="უკან" onClick={back}><Icon name="back" /></button>}
            <h2 id="pp-title">{TITLES[view]}</h2>
            {(view === 'picker' || view === 'success' || !family) && <button type="button" className="pp-icon-button pp-close" aria-label="დახურვა" onClick={close}><Icon name="close" size={18} /></button>}
          </header>
          {(view === 'rule' || view === 'amount') && <div className="pp-context">{identity}</div>}
          <div className="pp-scroll" ref={scroll}>
            <div ref={scene} className="pp-scene" key={view}>{content}</div>
          </div>
          {action && <footer className="pp-footer"><button type="button" className="pp-primary" onClick={action[1]} disabled={Boolean(action[2])}>{action[0]}</button></footer>}
        </section>
      </>}
      <span className="pp-home-indicator" aria-hidden="true" />
    </div>
  </div>;
}
