import { create } from 'zustand';
import { OrbState, SentinelEvent, HouseholdMember, ChatMessage, Camera } from './types';
import { HOUSEHOLD, CAMERAS, INITIAL_EVENTS, INITIAL_CHAT } from './data/initial';

interface AppStore {
  orbState: OrbState;
  events: SentinelEvent[];
  household: HouseholdMember[];
  cameras: Camera[];
  chat: ChatMessage[];
  armed: boolean;
  privacyMode: boolean;
  banner: { visible: boolean; event?: SentinelEvent };
  subscription: 'free' | 'home' | 'pro';
  unreadCount: number;

  setOrbState: (s: OrbState) => void;
  addEvent: (e: SentinelEvent) => void;
  addChatMessage: (m: ChatMessage) => void;
  updateMemberStatus: (id: string, status: 'home' | 'away', time?: Date) => void;
  setCameraMotion: (id: string, active: boolean, lastEvent?: string) => void;
  showBanner: (e: SentinelEvent) => void;
  hideBanner: () => void;
  toggleArmed: () => void;
  togglePrivacy: () => void;
  clearUnread: () => void;
}

export const useStore = create<AppStore>((set) => ({
  orbState: 'idle',
  events: INITIAL_EVENTS,
  household: HOUSEHOLD,
  cameras: CAMERAS,
  chat: INITIAL_CHAT,
  armed: true,
  privacyMode: false,
  banner: { visible: false },
  subscription: 'home',
  unreadCount: 0,

  setOrbState: (orbState) => set({ orbState }),

  addEvent: (e) =>
    set((s) => ({
      events: [e, ...s.events].slice(0, 150),
      unreadCount: s.unreadCount + (e.severity !== 'info' ? 1 : 0),
    })),

  addChatMessage: (m) => set((s) => ({ chat: [...s.chat, m] })),

  updateMemberStatus: (id, status, time = new Date()) =>
    set((s) => ({
      household: s.household.map((m) =>
        m.id === id
          ? {
              ...m,
              status,
              lastSeen: time,
              arrivals:   status === 'home' ? m.arrivals + 1   : m.arrivals,
              departures: status === 'away' ? m.departures + 1 : m.departures,
            }
          : m
      ),
    })),

  setCameraMotion: (id, motionActive, lastEvent) =>
    set((s) => ({
      cameras: s.cameras.map((c) =>
        c.id === id
          ? {
              ...c,
              motionActive,
              lastEvent: lastEvent ?? c.lastEvent,
              detectionCount: motionActive ? c.detectionCount + 1 : c.detectionCount,
            }
          : c
      ),
    })),

  showBanner: (e) => set({ banner: { visible: true, event: e } }),
  hideBanner: () => set({ banner: { visible: false } }),

  toggleArmed: () => set((s) => ({ armed: !s.armed })),

  togglePrivacy: () =>
    set((s) => ({
      privacyMode: !s.privacyMode,
      orbState: !s.privacyMode ? 'privacy' : 'idle',
      cameras: s.cameras.map((c) => ({
        ...c,
        status: !s.privacyMode ? 'privacy' : 'active',
      })),
    })),

  clearUnread: () => set({ unreadCount: 0 }),
}));
