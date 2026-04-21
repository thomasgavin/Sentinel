export const C = {
  bg:         '#060810',
  s1:         '#0D1020',
  s2:         '#141825',
  s3:         '#1C2233',
  s4:         '#242D44',
  border:     'rgba(148,163,255,0.08)',
  border2:    'rgba(148,163,255,0.15)',
  text:       '#F0F4FF',
  t2:         '#8892AA',
  t3:         '#3D4560',
  accent:     '#00E5FF',
  accentDim:  'rgba(0,229,255,0.12)',
  green:      '#00FF87',
  greenDim:   'rgba(0,255,135,0.10)',
  orange:     '#FF8A3D',
  orangeDim:  'rgba(255,138,61,0.12)',
  red:        '#FF3357',
  redDim:     'rgba(255,51,87,0.12)',
  amber:      '#FFD166',
  amberDim:   'rgba(255,209,102,0.12)',
  // Section tint backgrounds (very subtle color differentiation per section)
  feedBg:     '#0C1318',   // teal tint for live feed card
  statsBg:    '#0F0E1C',   // purple tint for stats card
  chatBg:     '#120E18',   // warm tint for chat card
  camBg:      '#0C1410',   // green tint for camera card
} as const;

export const ORB_GRADIENT: Record<string, readonly [string, string, string, string]> = {
  idle:    ['#1cf5ff', '#0090aa', '#001a22', '#050e12'],
  family:  ['#1cffa0', '#009960', '#001a0e', '#050e08'],
  unknown: ['#ffb46c', '#aa5500', '#1a0d00', '#0e0800'],
  threat:  ['#ff5577', '#aa0022', '#1a0008', '#0e0005'],
  privacy: ['#2a2a2a', '#151515', '#0a0a0a', '#050505'],
};

export const ORB_GLOW: Record<string, string> = {
  idle:    'rgba(0,229,255,0.45)',
  family:  'rgba(0,255,135,0.45)',
  unknown: 'rgba(255,138,61,0.45)',
  threat:  'rgba(255,51,87,0.55)',
  privacy: 'rgba(0,0,0,0)',
};

export const STATE_COLOR: Record<string, string> = {
  idle:    '#00E5FF',
  family:  '#00FF87',
  unknown: '#FF8A3D',
  threat:  '#FF3357',
  privacy: '#888888',
};

export const STATE_LABEL: Record<string, string> = {
  idle:    'Nobody home · Monitoring',
  family:  'Family detected',
  unknown: 'Unknown person',
  threat:  'Threat detected',
  privacy: 'Privacy mode',
};

export const EVENT_COLOR: Record<string, string> = {
  family_arrival:   C.green,
  family_departure: C.t2,
  unknown_person:   C.orange,
  package_delivery: C.accent,
  motion_resolved:  C.t3,
  threat:           C.red,
  system:           C.accent,
  daily_brief:      C.amber,
};

export const EVENT_BG: Record<string, string> = {
  family_arrival:   C.greenDim,
  family_departure: 'rgba(255,255,255,0.05)',
  unknown_person:   C.orangeDim,
  package_delivery: C.accentDim,
  motion_resolved:  'rgba(255,255,255,0.04)',
  threat:           C.redDim,
  system:           C.accentDim,
  daily_brief:      C.amberDim,
};

export const EVENT_ICON: Record<string, string> = {
  family_arrival:   'person',
  family_departure: 'person-outline',
  unknown_person:   'help-circle',
  package_delivery: 'cube',
  motion_resolved:  'checkmark-circle',
  threat:           'warning',
  system:           'shield-checkmark',
  daily_brief:      'sunny',
};

export const MEMBER_COLOR: Record<string, string> = {
  michael: C.accent,
  sarah:   C.green,
  emma:    C.amber,
  jake:    C.orange,
};

// ── LIGHT MODE PALETTE ────────────────────────────────────────────────────────

export const CL = {
  ...C,
  bg:      '#ECF0FF',
  s1:      '#FFFFFF',
  s2:      '#F3F5FF',
  s3:      '#E6E9F8',
  s4:      '#D2D6EE',
  border:  'rgba(13,16,50,0.07)',
  border2: 'rgba(13,16,50,0.13)',
  text:    '#080C1E',
  t2:      '#3A4060',
  t3:      '#8892AA',
  // section tints — lighter, pastel-tinted whites
  feedBg:  '#EAF5FF',
  statsBg: '#F0EEFF',
  chatBg:  '#FEF0FF',
  camBg:   '#EDFFF5',
} as const;

export type ColorPalette = typeof C;

export function getColors(isDark: boolean): ColorPalette {
  return (isDark ? C : CL) as ColorPalette;
}

// Darker state colors for light mode (bright neons are unreadable on white bg)
const STATE_COLOR_LIGHT: Record<string, string> = {
  idle:    '#007A94',
  family:  '#006B35',
  unknown: '#B85C00',
  threat:  '#C01030',
  privacy: '#555555',
};

export function getStateColor(state: string, isDark: boolean): string {
  return isDark
    ? (STATE_COLOR[state] ?? C.accent)
    : (STATE_COLOR_LIGHT[state] ?? '#007A94');
}

// Darker event colors for light mode
const EVENT_COLOR_LIGHT: Record<string, string> = {
  family_arrival:   '#006B35',
  family_departure: '#505A70',
  unknown_person:   '#B85C00',
  package_delivery: '#007A94',
  motion_resolved:  '#8892AA',
  threat:           '#C01030',
  system:           '#007A94',
  daily_brief:      '#8A6000',
};

export function getEventColor(type: string, isDark: boolean): string {
  return isDark
    ? (EVENT_COLOR[type] ?? C.t2)
    : (EVENT_COLOR_LIGHT[type] ?? '#505A70');
}
