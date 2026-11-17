'use client';

import StatePreview from './StatePreview';
import PrimaryButton, { PrimaryButtonCheck, PrimaryButtonSpinner } from '../../../components/PrimaryButton';
import { primaryButtonDisabledOpacity } from '../../../content/colors';
import { ACTION_COPY, STATUS_ACTION_COPY } from '../../../lib/transfer-flow.mjs';

const disabledPercent = primaryButtonDisabledOpacity * 100;
const details = {
  primary: {
    default: 'Credo gradient at full opacity.',
    disabled: `The gradient and label use ${disabledPercent}% opacity. Activation is blocked.`,
    processing: 'The gradient stays at full opacity while the request is in progress.',
    success: 'The green surface and check confirm completion.'
  },
  secondary: {
    default: '#F4F8F9 surface with a #1E6E91 label.',
    disabled: `The surface and label use ${disabledPercent}% opacity. Activation is blocked.`,
    processing: 'The surface stays at full opacity; the spinner uses the label colour.',
    success: 'A light green surface, green label and solid green check confirm completion.'
  }
};

function stateGroups(variant) {
  const copy = details[variant];
  return [
    { label: 'Interaction', states: [
      { id: 'default', label: 'Default', copy: ACTION_COPY.continue, detail: copy.default },
      { id: 'pressed', label: 'Pressed', copy: ACTION_COPY.continue, detail: 'The surface scales to 97% while pressed.' },
      { id: 'focused', label: 'Keyboard Focus', copy: ACTION_COPY.continue, detail: '2 px focus ring with a 3 px offset.' }
    ] },
    { label: 'Availability', states: [
      { id: 'disabled', label: 'Disabled', copy: ACTION_COPY.continue, detail: copy.disabled },
      { id: 'processing', label: 'Processing', copy: STATUS_ACTION_COPY.processing, detail: copy.processing }
    ] },
    { label: 'Feedback', states: [
      { id: 'success', label: 'Success', copy: STATUS_ACTION_COPY.success, detail: copy.success }
    ] }
  ];
}
export function ButtonPreview({ variant = 'primary', param = '__state', name = 'Primary Button' }) {
  return <StatePreview param={param} name={name} groups={stateGroups(variant)}>
    {active => <PrimaryButton
      variant={variant}
      disabled={active.id === 'disabled'}
      busy={active.id === 'processing'}
      success={active.id === 'success'}
      data-pointer-pressed={active.id === 'pressed' ? '' : undefined}
      data-preview-focus={active.id === 'focused' ? '' : undefined}
    >
      {active.id === 'processing' && <PrimaryButtonSpinner />}
      {active.id === 'success' && <PrimaryButtonCheck />}
      {active.copy}
    </PrimaryButton>}
  </StatePreview>;
}

export default function PrimaryButtonPreview() {
  return <ButtonPreview />;
}

export function SecondaryButtonPreview() {
  return <ButtonPreview variant="secondary" param="__secondary" name="Secondary Button" />;
}
