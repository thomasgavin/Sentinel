export type OrbState = 'idle' | 'family' | 'unknown' | 'threat' | 'privacy';

export type EventType =
  | 'family_arrival'
  | 'family_departure'
  | 'unknown_person'
  | 'package_delivery'
  | 'motion_resolved'
  | 'threat'
  | 'system'
  | 'daily_brief';

export type EventSeverity = 'info' | 'warning' | 'alert';

export interface SentinelEvent {
  id: string;
  type: EventType;
  title: string;
  body: string;
  time: Date;
  camera: string;
  resolved: boolean;
  personId?: string;
  severity: EventSeverity;
}

export interface HouseholdMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  status: 'home' | 'away';
  lastSeen: Date;
  color: string;
  arrivals: number;
  departures: number;
}

export interface ChatMessage {
  id: string;
  from: 'sentinel' | 'user';
  text: string;
  time: Date;
  color?: 'cyan' | 'green' | 'orange' | 'red';
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'offline' | 'privacy';
  motionActive: boolean;
  lastEvent: string;
  detectionCount: number;
}
