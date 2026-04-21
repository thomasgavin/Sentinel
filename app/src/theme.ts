export const C = {
  bg:         '#080808',
  s1:         '#0f0f0f',
  s2:         '#161616',
  s3:         '#1e1e1e',
  s4:         '#252525',
  border:     'rgba(255,255,255,0.06)',
  border2:    'rgba(255,255,255,0.12)',
  text:       '#ffffff',
  t2:         '#888888',
  t3:         '#444444',
  accent:     '#00E5FF',
  accentDim:  'rgba(0,229,255,0.12)',
  green:      '#00FF87',
  greenDim:   'rgba(0,255,135,0.12)',
  orange:     '#FF8A3D',
  orangeDim:  'rgba(255,138,61,0.15)',
  red:        '#FF3357',
  redDim:     'rgba(255,51,87,0.15)',
  amber:      '#FFD166',
  amberDim:   'rgba(255,209,102,0.15)',
} as const;

export const ORB_GRADIENT: Record<string, readonly [string, string, string, string]> = {
  idle:    ['#1cf5ff', '#0090aa', '#001a22', '#050e12'],
  family:  ['#1cffa0', '#009960', '#001a0e', '#050e08'],
  unknown: ['#ffb46c', '#aa5500', '#1a0d00', '#0e0800'],
  threat:  ['#ff5577', '#aa0022', '#1a0008', '#0e0005'],
  privacy: ['#555555', '#333333', '#1a1a1a', '#0a0a0a'],
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
  idle:    'Monitoring · Secure',
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
