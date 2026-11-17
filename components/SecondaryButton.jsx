import PrimaryButton, { PrimaryButtonCheck, PrimaryButtonSpinner } from './PrimaryButton';

// Credo's secondary button: the primary button's size, type, states and
// motion with the secondary colours (accent/subtle and label).
export { PrimaryButtonCheck as SecondaryButtonCheck, PrimaryButtonSpinner as SecondaryButtonSpinner };

export default function SecondaryButton(props) {
  return <PrimaryButton {...props} variant="secondary" />;
}
