import { typography } from '../../../content/typography';
import PrimaryButtonPreview, { SecondaryButtonPreview } from './PrimaryButtonPreview';
import { ConsentListPreview, OptionCardPreview, ProductCardPreview, UploadSlotPreview } from './LombardPreviews';
import { AccountFieldPreview, AmountPreview, CardArtPreview, CodeInputPreview, KeypadPreview, ListRowPreview, PageHeaderPreview, ReceiptRowsPreview, SearchFieldPreview, SegmentedControlPreview, TrayPreview } from './FoundationPreviews';

const CHINA = { title: 'China transfer', href: '/studies/transfers' };
const ORDERS = { title: 'Automatic orders', href: '/studies/automatic-orders' };
const LOMBARD = { title: 'Auto lombard', href: '/studies/auto-lombard' };
const action = typography.action;

/** One entry per component page, in sidebar (alphabetical) order. */
export const components = [
  { slug: 'account-field', title: 'Account Field', description: 'Where the money comes from, on a quiet card: card art, account name, balance.', spec: '80 px · 16 px radius · secondary button surface · field card art · label over name · balance · up/down chevrons', Preview: AccountFieldPreview, usedIn: [] },
  { slug: 'amount-display', title: 'Amount Display', description: 'The large keypad-entered amount, with a digit morph and an optional caption.', spec: 'Amount type · currency at 70% · Torph digit morph · optional caption', Preview: AmountPreview, usedIn: [CHINA, ORDERS, LOMBARD] },
  { slug: 'card-art', title: 'Card Art', description: 'A small card image drawn in CSS, at three sizes and two finishes.', spec: 'chip 20 × 13 · thumb 40 × 26 · field 44 × 28.6 · dark and blue finishes', Preview: CardArtPreview, usedIn: [ORDERS] },
  { slug: 'code-input', title: 'Code Input', description: 'One box per digit of a one-time code; the keypad fills it.', spec: '54 × 62 boxes · 12 px gap · code type · active box outlined · digit pop 180 ms', Preview: CodeInputPreview, usedIn: [ORDERS, LOMBARD] },
  { slug: 'consent-list', title: 'Consent List', description: 'Agreements with square marks, unticked until the person ticks them.', spec: 'Square SelectMark 26 px · option type on supporting leading · 12 px row padding · −3 px optical mark', Preview: ConsentListPreview, usedIn: [ORDERS, LOMBARD] },
  { slug: 'keypad', title: 'Keypad', description: 'Numeric keys for amounts, numbers and codes, with press feedback.', spec: '3 × 4 keys · 64 px height · 12 px gaps · Keypad number type', Preview: KeypadPreview, usedIn: [CHINA, ORDERS, LOMBARD] },
  { slug: 'list-row', title: 'List Row', description: 'A tappable row: leading icon or logo, title, optional subtitle, badge and trailing mark.', spec: '48 px row · 40 px leading icon · option label type · chevron, SelectMark or none · ListRows: 12 px gap, 60 px pitch', Preview: ListRowPreview, usedIn: [CHINA, ORDERS, LOMBARD] },
  { slug: 'option-card', title: 'Option Card', description: 'One choice in a list of choices: a grey card with a coloured glyph circle.', spec: 'Min 76 px · 20 px radius · bg/subtle · 48 px circle in category/* with a white 24 px glyph · option title · optional receipt-label line · OptionCards: 12 px gap', Preview: OptionCardPreview, usedIn: [LOMBARD] },
  { slug: 'page-header', title: 'Page Header', description: 'Back chevron, centred title and a balancing slot at the top of a screen.', spec: '48 px back slot · Tray title type, centred · 48 px end slot · screens set position and divider', Preview: PageHeaderPreview, usedIn: [CHINA, ORDERS, LOMBARD] },
  { slug: 'primary-button', title: 'Primary Button', description: 'The one main action, with pressed, disabled, sending and success states.', spec: `56 px height · 32 px radius · Inter ${action.size}/${action.leading} px · ${action.weight}`, Preview: PrimaryButtonPreview, usedIn: [CHINA, ORDERS, LOMBARD] },
  { slug: 'product-card', title: 'Product Card', description: 'One product on Products: a solid card in its category colour.', spec: '120 px tall · 20 px radius · category/* fill · white 26 px glyph · option title · detail at 75% white · optional badge on an 18% dark tint · ProductCards: 2 columns, 12 px gap', Preview: ProductCardPreview, usedIn: [LOMBARD] },
  { slug: 'receipt-rows', title: 'Receipt Rows', description: 'Label and value pairs for a review, with an optional inline action.', spec: '32 px rows · supporting label · receipt value · optional inline action', Preview: ReceiptRowsPreview, usedIn: [CHINA, ORDERS, LOMBARD] },
  { slug: 'search-field', title: 'Search Field', description: 'A quiet search input with a clear button once there is text.', spec: '44 px · 12 px radius · quiet surface · search icon · option type · clear button with text', Preview: SearchFieldPreview, usedIn: [ORDERS] },
  { slug: 'secondary-button', title: 'Secondary Button', description: 'The primary button’s shape and motion in the quiet secondary colours.', spec: 'Same as Primary · accent/subtle surface · accent/text label and icons', Preview: SecondaryButtonPreview, usedIn: [ORDERS, LOMBARD] },
  { slug: 'segmented-control', title: 'Segmented Control', description: 'Two views of one list, with a sliding pill.', spec: '44 px · quiet track · white pill with soft shadow · option label type · 240 ms ease-out', Preview: SegmentedControlPreview, usedIn: [ORDERS] },
  { slug: 'tray', title: 'Tray', description: 'The bottom sheet shell: title, close button, divider, body and footer.', spec: '24 px top radius · 40 px icon buttons · title, divider, body, footer', Preview: TrayPreview, usedIn: [CHINA, ORDERS, LOMBARD] },
  { slug: 'upload-slot', title: 'Upload Slot', description: 'One photo or video to add, with uploading, done and error states.', spec: '104 px tile (192 wide) · 16 px radius · secondary surface · label under the tile · error message under the slot', Preview: UploadSlotPreview, usedIn: [LOMBARD] }
];

export const componentBySlug = slug => components.find(item => item.slug === slug);
