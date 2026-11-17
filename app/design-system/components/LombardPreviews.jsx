'use client';

import { useState } from 'react';
import StatePreview from './StatePreview';
import ConsentList from '../../../components/ConsentList';
import OptionCard, { OptionCards } from '../../../components/OptionCard';
import ProductCard, { ProductCards } from '../../../components/ProductCard';
import { PRODUCTS } from '../../../lib/auto-lombard-flow.mjs';
import ProductGlyph from '../../../components/ProductGlyph';
import UploadSlot from '../../../components/UploadSlot';

// Previews for the components added with the auto lombard study (plan 007).
const pad = { padding: '24px' };

export function LiveConsents() {
  const items = ['Processing of my personal data', 'Checking my credit history with Creditinfo'];
  const [checked, setChecked] = useState(items.map(() => false));
  return <ConsentList items={items} checked={checked} onChange={(index, value) => setChecked(list => list.map((item, i) => i === index ? value : item))} />;
}

export function ConsentListPreview() {
  const groups = [{ label: 'Content', states: [{ id: 'live', label: 'Unticked', detail: 'Square SelectMark on the label’s first line (−3 px optical). Nothing starts ticked. Tap to tick.' }] }];
  return <StatePreview param="__consent" name="Consent list" groups={groups} canvasHeight={160}>{() => <div style={pad}><LiveConsents /></div>}</StatePreview>;
}

export function UploadSlotPreview() {
  const groups = [{ label: 'State', states: [
    { id: 'empty', label: 'Empty', detail: 'Tappable tile on the secondary-button surface; the label always sits under it, so nothing moves when a photo is added.' },
    { id: 'uploading', label: 'Uploading', detail: 'A small spinner fades in over the icon (100 ms).' },
    { id: 'done', label: 'Done', detail: 'The photo fades in (170 ms) and the check grows from its centre, as in SelectMark. Tap to retake.' },
    { id: 'error', label: 'Error', detail: 'Error surface and outline fade in (150 ms), with a retake icon and the message under the slot it describes. No shake.' }
  ] }];
  return <StatePreview param="__upload" name="Upload slot" groups={groups} canvasHeight={220}>
    {active => <div style={{ ...pad, width: 220 }}><UploadSlot label="Engine" state={active.id} image="/assets/lombard/car-photo.jpg"
      error="Engine not clear. Retake the photo." onClick={() => {}} /></div>}
  </StatePreview>;
}

export function OptionCardPreview() {
  const groups = [{ label: 'Content', states: [
    { id: 'title', label: 'Title', detail: 'Light grey container, 48 px circle in the product colour with its white glyph, option-type title. The card is the tap target: no chevron.' },
    { id: 'subtitle', label: 'With a line', detail: 'One supporting line, only when the title alone is not enough to choose (Auto lombard).' },
    { id: 'pressed', label: 'Pressed', detail: 'The card scales to 97% while pressed.' }
  ] }];
  return <StatePreview param="__option" name="Option card" groups={groups} canvasHeight={active => active.id === 'title' ? 280 : 140}>
    {active => <div style={pad}><OptionCards>{active.id === 'title'
      ? <>
        <OptionCard icon={<ProductGlyph name="accounts" size={24} />} color="ink" title="Accounts and cards" onClick={() => {}} />
        <OptionCard icon={<ProductGlyph name="loans" size={24} />} color="blue" title="Loans and installments" onClick={() => {}} />
        <OptionCard icon={<ProductGlyph name="deposits" size={24} />} color="green" title="Deposits" onClick={() => {}} />
      </>
      : <OptionCard icon={<ProductGlyph name="lombard" size={24} />} color="blue" title="Auto lombard" subtitle={active.id === 'subtitle' ? 'Money against your car' : undefined}
        data-pointer-pressed={active.id === 'pressed' ? '' : undefined} onClick={() => {}} />}</OptionCards></div>}
  </StatePreview>;
}

export function ProductCardPreview() {
  const groups = [{ label: 'Content', states: [
    { id: 'grid', label: 'Products', detail: 'One card per product in its category colour, two columns. White glyph top-left; the name and balance at the bottom, the balance at 75% white.' },
    { id: 'badge', label: 'With a badge', detail: 'A short status on a dark tint, top-right (Under review after an application).' },
    { id: 'pressed', label: 'Pressed', detail: 'The card scales to 97% while pressed.' }
  ] }];
  const loans = PRODUCTS.find(item => item.id === 'loans');
  return <StatePreview param="__product" name="Product card" groups={groups} canvasHeight={active => active.id === 'grid' ? 440 : 170}>
    {active => <div style={pad}><ProductCards>{active.id === 'grid'
      ? PRODUCTS.map(item => <ProductCard key={item.id} icon={<ProductGlyph name={item.id} />} color={item.color} title={item.short} detail={item.balance} onClick={() => {}} />)
      : <ProductCard icon={<ProductGlyph name="loans" />} color="blue" title={loans.short} detail={loans.balance}
        badge={active.id === 'badge' ? 'Under review' : undefined} data-pointer-pressed={active.id === 'pressed' ? '' : undefined} onClick={() => {}} />}</ProductCards></div>}
  </StatePreview>;
}
