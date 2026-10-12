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
  objective: string;
  background: string;
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

export const MAX_ORDERS_COUNT = 999;

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
