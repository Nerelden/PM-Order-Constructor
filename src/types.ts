export type ClientCategory = 'association' | 'syndicate' | 'office' | 'individual';

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export type AccentColor =
  | 'cyan'
  | 'amber'
  | 'crimson'
  | 'emerald'
  | 'purple'
  | 'slate'
  | 'indigo'
  | 'orange'
  | 'rose'
  | 'teal'
  | 'bronze'
  | 'violet';

export interface OrderContract {
  id: string;
  code: string;
  title: string;
  client: string;
  clientCategory: ClientCategory;
  associationName: string;
  associationRole: string;
  associationCode: string;
  romanNumeral?: string;
  accentColor?: AccentColor;
  // RGB Color selector support
  colorHex?: string;
  colorRgb?: RGBColor;
  // Watermark via URL
  watermarkUrl?: string;
  gradeRequirement: string;
  location: string;
  threatRating: string;
  rewardAhn: number;
  rewardBonus?: string;
  rewardRecipient?: 'all' | 'operator';
  objective: string;
  background: string;
  conditions?: string[];
  threats: string[];
  details: string;
  tacticalNotes?: string[];
  status: 'available' | 'in_progress' | 'completed' | 'failed';
  assignedFixer?: string;
  assignedOffice?: string;
  signedDate?: string;
  stampText?: string;
  updatedAt?: number;
}

export type VisualTheme = 'parchment' | 'terminal';

export interface CityDate {
  day: number;
  month: number; // 1-12
  year: number;
  updatedAt?: number;
}

export const DEFAULT_CITY_DATE: CityDate = {
  day: 9,
  month: 7,
  year: 983,
};

export const MONTH_NAMES_NOMINATIVE = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

export const MONTH_NAMES_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

export function getDaysInMonth(month: number, year: number): number {
  if (month === 2) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return isLeap ? 29 : 28;
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30;
  }
  return 31;
}

export function normalizeCityDate(input: Partial<CityDate> | null | undefined): CityDate {
  const rawYear = Number(input?.year);
  const year = Number.isFinite(rawYear) && rawYear >= 1 ? Math.min(99999, Math.trunc(rawYear)) : DEFAULT_CITY_DATE.year;
  const rawMonth = Number(input?.month);
  const month = Number.isFinite(rawMonth) ? Math.max(1, Math.min(12, Math.trunc(rawMonth))) : DEFAULT_CITY_DATE.month;
  const maxDay = getDaysInMonth(month, year);
  const rawDay = Number(input?.day);
  const day = Number.isFinite(rawDay) ? Math.max(1, Math.min(maxDay, Math.trunc(rawDay))) : DEFAULT_CITY_DATE.day;
  return {
    day,
    month,
    year,
    ...(typeof input?.updatedAt === 'number' ? { updatedAt: input.updatedAt } : {}),
  };
}

export function formatCityDate(date: CityDate): string {
  const safe = normalizeCityDate(date);
  const monthLabel = MONTH_NAMES_GENITIVE[safe.month - 1] || MONTH_NAMES_GENITIVE[6];
  return `${safe.day} ${monthLabel} ${safe.year} года`;
}

// Helper functions for RGB and Hex color conversions
export function hexToRgb(hex: string): RGBColor {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16) || 0,
      g: parseInt(clean[1] + clean[1], 16) || 0,
      b: parseInt(clean[2] + clean[2], 16) || 0,
    };
  }
  return {
    r: parseInt(clean.substring(0, 2), 16) || 0,
    g: parseInt(clean.substring(2, 4), 16) || 0,
    b: parseInt(clean.substring(4, 6), 16) || 0,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(Number(val) || 0)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getOrderRgb(order: OrderContract): RGBColor {
  if (order.colorRgb && typeof order.colorRgb.r === 'number') {
    return order.colorRgb;
  }
  if (order.colorHex) {
    return hexToRgb(order.colorHex);
  }
  // Fallbacks based on accentColor or category
  switch (order.accentColor) {
    case 'amber':
      return { r: 217, g: 119, b: 6 };
    case 'crimson':
      return { r: 220, g: 38, b: 38 };
    case 'emerald':
      return { r: 16, g: 185, b: 129 };
    case 'purple':
      return { r: 168, g: 85, b: 247 };
    case 'slate':
      return { r: 148, g: 163, b: 184 };
    case 'indigo':
      return { r: 99, g: 102, b: 241 };
    case 'orange':
      return { r: 249, g: 115, b: 22 };
    case 'rose':
      return { r: 244, g: 63, b: 94 };
    case 'teal':
      return { r: 20, g: 184, b: 166 };
    case 'bronze':
      return { r: 180, g: 83, b: 9 };
    case 'violet':
      return { r: 139, g: 92, b: 246 };
    case 'cyan':
    default:
      return { r: 6, g: 182, b: 212 };
  }
}
