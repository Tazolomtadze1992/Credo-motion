import {
  ArrowLeftRight, Bookmark, Calendar, Camera, Car, CarFront, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown,
  CircleAlert, CreditCard, Droplet, Ellipsis, FileText, Flame, Globe, GraduationCap, HandCoins, House, Info, Landmark,
  LayoutGrid, Lock, Pencil, PiggyBank, Play, Plus, Repeat, Rocket, RotateCcw, Search, Shield, ShoppingBag, Smartphone,
  Star, Sun, Video, Wallet, Wifi, X, Zap
} from 'lucide-react';

// Credo's icon set. Screens use Credo names only (<Icon name="close" />);
// this map is the one place that knows the library. Today it is Lucide
// (lucide-react, ISC); swapping libraries means changing this map, not screens.
export const ICONS = {
  // Navigation
  back: ChevronLeft,
  select: ChevronsUpDown,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  close: X,
  more: Ellipsis,
  // Actions
  add: Plus,
  check: Check,
  edit: Pencil,
  search: Search,
  repeat: Repeat,
  transfer: ArrowLeftRight,
  // Objects
  bank: Landmark,
  card: CreditCard,
  globe: Globe,
  wallet: Wallet,
  calendar: Calendar,
  file: FileText,
  lock: Lock,
  home: House,
  products: LayoutGrid,
  car: Car,
  'car-front': CarFront,
  'piggy-bank': PiggyBank,
  'hand-coins': HandCoins,
  'shopping-bag': ShoppingBag,
  shield: Shield,
  smartphone: Smartphone,
  'graduation-cap': GraduationCap,
  rocket: Rocket,
  camera: Camera,
  video: Video,
  play: Play,
  retake: RotateCcw,
  // Status and services
  info: Info,
  alert: CircleAlert,
  sun: Sun,
  star: Star,
  template: Bookmark,
  lightning: Zap,
  flame: Flame,
  drop: Droplet,
  wifi: Wifi
};

export const ICON_NAMES = Object.keys(ICONS);

// Size tiers, measured from Family screenshots (iPhone 12): strokes stay heavy
// at small sizes instead of thinning with the icon. Screens pick a tier by
// name; they never pass raw sizes.
export const ICON_SIZES = {
  nav: { size: 26, stroke: 2.25, use: 'Top-bar back, close, help, add; keypad delete' },
  content: { size: 24, stroke: 2, use: 'Free-standing icons, such as row icons without a circle' },
  leading: { size: 20, stroke: 2, use: 'Inside a tinted 40 px circle, matching the China icon' },
  small: { size: 18, stroke: 2.5, use: 'Close inside a circle button, search in a field' },
  // Row chevrons match the tray's X: the X draws 9 px square at 18 px; the
  // chevron's glyph is half as wide, so at 24 px it draws 12 px tall, and both
  // use the same 2.5 stroke (user decision 2026-11-16; was 18 / 1.75).
  trailing: { size: 24, stroke: 2.5, use: 'Row chevrons, as heavy as the tray’s X' },
  inline: { size: 18, stroke: 1.75, use: 'Select chevrons beside a value, such as Pay from' },
  badge: { size: 12, stroke: 1.75, use: 'Inside a badge, such as Fast' }
};

/**
 * @param {string} name  a Credo icon name (see ICONS)
 * @param {keyof ICON_SIZES} [size]  size tier
 * @param {string} [label]  accessible name; without it the icon is decorative
 * Colour follows `currentColor`.
 */
export default function Icon({ name, size = 'content', label, className = '', ...props }) {
  const Glyph = ICONS[name];
  const tier = ICON_SIZES[size];
  if (!Glyph || !tier) {
    if (process.env.NODE_ENV !== 'production') console.warn(`Unknown Credo icon "${name}" or size "${size}"`);
    return null;
  }
  return <Glyph size={tier.size} strokeWidth={tier.stroke} absoluteStrokeWidth data-size={size}
    className={`credo-icon ${className}`} focusable="false"
    aria-hidden={label ? undefined : true} role={label ? 'img' : undefined} aria-label={label} {...props} />;
}
