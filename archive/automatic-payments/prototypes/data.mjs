export const CATEGORIES = [
  { id: 'energy', name: 'ელექტროენერგია', icon: 'bolt', tone: 'amber' },
  { id: 'gas', name: 'ბუნებრივი აირი', icon: 'flame', tone: 'rose' },
  { id: 'water', name: 'წყალი', icon: 'drop', tone: 'blue' },
  { id: 'internet', name: 'ინტერნეტი და მობილური', icon: 'wifi', tone: 'violet' },
];

export const PROVIDERS = [
  { id: 'telmico', category: 'energy', name: 'თელმიკო', alias: 'telmico tbilisi', icon: 'bolt', tone: 'amber', demo: '492312312', subscriber: 'ნინო აბაშიძე' },
  { id: 'ep', category: 'energy', name: 'ენერგო-პრო ჯორჯია', alias: 'energo pro georgia', icon: 'bolt', tone: 'amber', demo: '123456789', subscriber: 'ანა კიკნაძე' },
  { id: 'teg', category: 'gas', name: 'თბილისი ენერჯი', alias: 'tbilisi energy gas', icon: 'flame', tone: 'rose', demo: '247108035', subscriber: 'გიორგი მაისურაძე' },
  { id: 'socar', category: 'gas', name: 'სოკარ ჯორჯია გაზი', alias: 'socar georgia gas', icon: 'flame', tone: 'rose', demo: '123456789', subscriber: 'ანა კიკნაძე' },
  { id: 'gwp', category: 'water', name: 'ჯორჯიან უოთერ ენდ ფაუერი', alias: 'georgian water and power gwp', icon: 'drop', tone: 'blue', demo: '123456789', subscriber: 'ანა კიკნაძე' },
  { id: 'magti', category: 'internet', name: 'მაგთი', alias: 'magti', icon: 'wifi', tone: 'violet', demo: '555010203', subscriber: 'ნინო აბაშიძე' },
  { id: 'silk', category: 'internet', name: 'სილქნეტი', alias: 'silknet', icon: 'wifi', tone: 'violet', demo: '123456789', subscriber: 'ანა კიკნაძე' },
];

export const INITIAL_TEMPLATES = [
  { label: 'სახლის დენი', provider: 'telmico', number: '492312312' },
  { label: 'სახლის ინტერნეტი', provider: 'magti', number: '555010203' },
];

export const ACCOUNTS = [
  { id: 'main', name: 'მთავარი ანგარიში', suffix: '4821', balance: '1 240.50 ₾', tone: 'blue' },
  { id: 'daily', name: 'ყოველდღიური ანგარიში', suffix: '2094', balance: '386.20 ₾', tone: 'violet' },
];

export const RULES = {
  bill: { title: 'დავალიანების დაფიქსირებისას', short: 'დავალიანებისას', description: 'გადაიხადე დავალიანება მის დაფიქსირებისას', icon: 'bolt' },
  monthly: { title: 'ყოველთვიურად არჩეულ დღეს', short: 'ყოველთვიურად', description: 'გადაიხადე მითითებული თანხა თვეში ერთხელ', icon: 'calendar' },
};

export const AGREEMENTS = [
  { title: 'ავტომატური გადახდის პირობები', paragraphs: ['არჩეული ანგარიშიდან თანხა ჩამოიჭრება თქვენ მიერ მითითებული წესის მიხედვით. გადახდის პარამეტრების შეცვლა და წესის გაუქმება შესაძლებელია ავტომატური გადახდების სიიდან.', 'დავალიანების დაფიქსირებისას გადახდა შესრულდება დადგენილი მაქსიმალური თანხის ფარგლებში. თუ დავალიანება ლიმიტს გადააჭარბებს, თანხა არ ჩამოიჭრება.'] },
  { title: 'მონაცემების დამუშავებაზე თანხმობა', paragraphs: ['გადახდის შესასრულებლად გამოიყენება აბონენტის ნომერი და მომსახურების მიმწოდებლის მიერ დაბრუნებული ინფორმაცია.', 'ეს ტექსტი პროტოტიპისთვისაა. ფორმა მუშაობს სატესტო მონაცემებით.'] },
];

export const TITLES = {
  picker: 'დაამატე გადახდა',
  subscriber: 'აბონენტის ნომერი',
  rule: 'გადახდის წესი',
  amount: 'გადახდის პარამეტრები',
  calendar: 'გადახდის დღე',
  account: 'აირჩიე ანგარიში',
  review: 'გადახედე დეტალებს',
  terms: 'წესები და პირობები',
  otp: 'დაადასტურე გააქტიურება',
  success: 'ავტომატური გადახდა',
  details: 'გადახდის დეტალები',
};

export const OTP = '4721';
export const MONTHLY_FEE = '1.00 ₾';
export const dateCopy = day => day === 31 ? 'ყოველი თვის ბოლო დღეს' : `ყოველი თვის ${day} რიცხვში`;
export const digits = (value, max) => value.replace(/\D/g, '').slice(0, max);

export function queryProviders(query, category) {
  const text = query.trim().toLowerCase();
  return PROVIDERS.filter(provider => text
    ? `${provider.name} ${provider.alias}`.toLowerCase().includes(text)
    : provider.category === category);
}
