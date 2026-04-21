import { useStore } from './store';
import { SentinelEvent, ChatMessage, OrbState } from './types';

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const fmt = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

function getStore() {
  return useStore.getState();
}

function addEvent(e: SentinelEvent) { getStore().addEvent(e); }
function addChat(m: ChatMessage)    { getStore().addChatMessage(m); }
function setOrb(s: OrbState)        { getStore().setOrbState(s); }
function resetOrb(delay = 4500)     { setTimeout(() => getStore().setOrbState('idle'), delay); }
function banner(e: SentinelEvent)   { getStore().showBanner(e); setTimeout(() => getStore().hideBanner(), 4500); }
function motion(camId: string, label: string) {
  getStore().setCameraMotion(camId, true, label);
  setTimeout(() => getStore().setCameraMotion(camId, false), 5000);
}

// ── SCENARIO DEFINITIONS ─────────────────────────────────────────────────────

type Scenario = {
  id: string;
  minMs: number;
  maxMs: number;
  canRun: () => boolean;
  run: () => void;
};

const SCENARIOS: Scenario[] = [
  // Jake arrives
  {
    id: 'jake_arrive',
    minMs: 10000, maxMs: 25000,
    canRun: () => getStore().household.find(m => m.id === 'jake')?.status === 'away',
    run: () => {
      const t = new Date();
      const e: SentinelEvent = {
        id: uid(), type: 'family_arrival',
        title: 'Jake arrived home',
        body: 'Recognized via face ID · Front Door',
        time: t, camera: 'Front Door', resolved: true, personId: 'jake', severity: 'info',
      };
      motion('cam-front', `Jake arrived · just now`);
      addEvent(e);
      getStore().updateMemberStatus('jake', 'home', t);
      setOrb('family'); banner(e); resetOrb();
      setTimeout(() => addChat({ id: uid(), from: 'sentinel', text: `Jake just got home. Front door, ${fmt(t)}.`, time: new Date(), color: 'green' }), 2000);
    },
  },
  // Jake departs
  {
    id: 'jake_depart',
    minMs: 12000, maxMs: 30000,
    canRun: () => getStore().household.find(m => m.id === 'jake')?.status === 'home',
    run: () => {
      const t = new Date();
      const e: SentinelEvent = {
        id: uid(), type: 'family_departure',
        title: 'Jake left',
        body: 'Recognized via face ID · Front Door',
        time: t, camera: 'Front Door', resolved: true, personId: 'jake', severity: 'info',
      };
      motion('cam-front', `Jake left · just now`);
      addEvent(e); getStore().updateMemberStatus('jake', 'away', t); banner(e);
    },
  },
  // Emma arrives
  {
    id: 'emma_arrive',
    minMs: 10000, maxMs: 25000,
    canRun: () => getStore().household.find(m => m.id === 'emma')?.status === 'away',
    run: () => {
      const t = new Date();
      const e: SentinelEvent = {
        id: uid(), type: 'family_arrival',
        title: 'Emma arrived home',
        body: 'Recognized via face ID · Front Door',
        time: t, camera: 'Front Door', resolved: true, personId: 'emma', severity: 'info',
      };
      motion('cam-front', `Emma arrived · just now`);
      addEvent(e);
      getStore().updateMemberStatus('emma', 'home', t);
      setOrb('family'); banner(e); resetOrb();
      setTimeout(() => addChat({ id: uid(), from: 'sentinel', text: `Emma just got home. Front door, ${fmt(t)}.`, time: new Date(), color: 'green' }), 2000);
    },
  },
  // Emma departs
  {
    id: 'emma_depart',
    minMs: 12000, maxMs: 30000,
    canRun: () => getStore().household.find(m => m.id === 'emma')?.status === 'home',
    run: () => {
      const t = new Date();
      const e: SentinelEvent = {
        id: uid(), type: 'family_departure',
        title: 'Emma left',
        body: 'Recognized via face ID · Front Door',
        time: t, camera: 'Front Door', resolved: true, personId: 'emma', severity: 'info',
      };
      motion('cam-front', `Emma left · just now`);
      addEvent(e); getStore().updateMemberStatus('emma', 'away', t); banner(e);
    },
  },
  // Michael arrives
  {
    id: 'michael_arrive',
    minMs: 15000, maxMs: 35000,
    canRun: () => getStore().household.find(m => m.id === 'michael')?.status === 'away',
    run: () => {
      const t = new Date();
      const { household } = getStore();
      const othersHome = household.filter(m => m.id !== 'michael' && m.status === 'home').map(m => m.name);
      const e: SentinelEvent = {
        id: uid(), type: 'family_arrival',
        title: 'Michael arrived home',
        body: 'Recognized via face ID · Garage',
        time: t, camera: 'Garage', resolved: true, personId: 'michael', severity: 'info',
      };
      motion('cam-garage', `Michael arrived · just now`);
      addEvent(e);
      getStore().updateMemberStatus('michael', 'home', t);
      setOrb('family'); banner(e); resetOrb();
      const msg = othersHome.length
        ? `Michael just got home. Garage, ${fmt(t)}. ${othersHome.join(' and ')} ${othersHome.length === 1 ? 'is' : 'are'} already inside.`
        : `Michael just got home. Garage, ${fmt(t)}.`;
      setTimeout(() => addChat({ id: uid(), from: 'sentinel', text: msg, time: new Date(), color: 'green' }), 2000);
    },
  },
  // Michael departs
  {
    id: 'michael_depart',
    minMs: 15000, maxMs: 35000,
    canRun: () => getStore().household.find(m => m.id === 'michael')?.status === 'home',
    run: () => {
      const t = new Date();
      const e: SentinelEvent = {
        id: uid(), type: 'family_departure',
        title: 'Michael left',
        body: 'Recognized via face ID · Garage',
        time: t, camera: 'Garage', resolved: true, personId: 'michael', severity: 'info',
      };
      motion('cam-garage', `Michael left · just now`);
      addEvent(e); getStore().updateMemberStatus('michael', 'away', t); banner(e);
    },
  },
  // Package delivery
  {
    id: 'package',
    minMs: 20000, maxMs: 55000,
    canRun: () => true,
    run: () => {
      const carriers = ['UPS', 'FedEx', 'Amazon', 'USPS'];
      const carrier = carriers[Math.floor(Math.random() * carriers.length)];
      const t = new Date();
      const e: SentinelEvent = {
        id: uid(), type: 'package_delivery',
        title: 'Package delivery',
        body: `${carrier} carrier · Left on porch · Front Door`,
        time: t, camera: 'Front Door', resolved: true, severity: 'info',
      };
      motion('cam-front', `${carrier} delivery · just now`);
      addEvent(e); banner(e);
      setTimeout(() => addChat({
        id: uid(), from: 'sentinel',
        text: `${carrier} delivery at ${fmt(t)} — your package has been left on the porch.`,
        time: new Date(), color: 'cyan',
      }), 3000);
    },
  },
  // Unknown person
  {
    id: 'unknown',
    minMs: 30000, maxMs: 80000,
    canRun: () => true,
    run: () => {
      const t = new Date();
      const e: SentinelEvent = {
        id: uid(), type: 'unknown_person',
        title: 'Unknown person at front door',
        body: `No face match · Confidence 0.${30 + Math.floor(Math.random() * 15)} · Front Door`,
        time: t, camera: 'Front Door', resolved: false, severity: 'warning',
      };
      motion('cam-front', `Unknown person · just now`);
      addEvent(e);
      setOrb('unknown'); banner(e);
      addChat({
        id: uid(), from: 'sentinel',
        text: `Unknown person at your front door, ${fmt(t)}. They've been there about a minute. Do you recognise them?`,
        time: new Date(t.getTime() + 1500), color: 'orange',
      });
      // Resolve after 10–15s
      const resolveDelay = 10000 + Math.random() * 5000;
      setTimeout(() => {
        const re: SentinelEvent = {
          id: uid(), type: 'motion_resolved',
          title: 'Unknown person left',
          body: 'Visitor departed · No action taken · Front Door',
          time: new Date(), camera: 'Front Door', resolved: true, severity: 'info',
        };
        addEvent(re); setOrb('idle');
        addChat({ id: uid(), from: 'sentinel', text: "They've left. Clip saved. No further action taken.", time: new Date(), color: 'cyan' });
      }, resolveDelay);
    },
  },
  // Background motion (silent — no banner, no chat)
  {
    id: 'motion_bg',
    minMs: 8000, maxMs: 20000,
    canRun: () => true,
    run: () => {
      const cameras = ['Backyard', 'Driveway', 'Side Gate', 'Front Door'];
      const reasons = [
        'Tree movement in wind',
        'Shadow from passing car',
        'Neighborhood cat',
        'Light change detected',
        'Bird on lens',
      ];
      const cam = cameras[Math.floor(Math.random() * cameras.length)];
      const reason = reasons[Math.floor(Math.random() * reasons.length)];
      const camId = cam === 'Backyard' ? 'cam-back' : cam === 'Driveway' ? 'cam-driveway' : cam === 'Garage' ? 'cam-garage' : 'cam-front';
      motion(camId, `Motion resolved · just now`);
      addEvent({
        id: uid(), type: 'motion_resolved',
        title: 'Motion resolved',
        body: `${reason} · No person detected · ${cam}`,
        time: new Date(), camera: cam, resolved: true, severity: 'info',
      });
    },
  },
  // Threat (rare)
  {
    id: 'threat',
    minMs: 90000, maxMs: 180000,
    canRun: () => true,
    run: () => {
      const t = new Date();
      const e: SentinelEvent = {
        id: uid(), type: 'threat',
        title: 'Possible break-in detected',
        body: 'Unusual entry attempt · Back Door · Response window open',
        time: t, camera: 'Back Door', resolved: false, severity: 'alert',
      };
      addEvent(e); setOrb('threat'); banner(e);
      addChat({
        id: uid(), from: 'sentinel',
        text: "Possible break-in detected — back door. 60-second response window open. I'm ready to contact emergency services. Tap to cancel if this is a false alarm.",
        time: new Date(t.getTime() + 1000), color: 'red',
      });
      setTimeout(() => {
        setOrb('idle');
        addEvent({
          id: uid(), type: 'motion_resolved',
          title: 'Threat resolved',
          body: 'No further activity detected · System returned to normal · Back Door',
          time: new Date(), camera: 'Back Door', resolved: true, severity: 'info',
        });
        addChat({ id: uid(), from: 'sentinel', text: "No further activity. System returned to normal. Clip saved for your review.", time: new Date(), color: 'cyan' });
      }, 18000);
    },
  },
  // Sentinel check-in (proactive message)
  {
    id: 'checkin',
    minMs: 35000, maxMs: 70000,
    canRun: () => true,
    run: () => {
      const { household } = getStore();
      const home = household.filter(m => m.status === 'home').map(m => m.name);
      const options = [
        home.length
          ? `Just checking in — ${home.join(' and ')} ${home.length === 1 ? 'is' : 'are'} home. All cameras clear.`
          : 'Home is currently empty. All doors locked. System armed.',
        'No unusual activity in the last hour. Your home is secure.',
        `${home.length} of ${household.length} household members home right now. Everything looks normal.`,
        'Motion in the backyard — resolved as wind. Nothing to worry about.',
        'All four cameras online. No alerts. Have a good evening.',
      ];
      addChat({
        id: uid(), from: 'sentinel',
        text: options[Math.floor(Math.random() * options.length)],
        time: new Date(), color: 'cyan',
      });
    },
  },
];

// ── ENGINE LOOP ───────────────────────────────────────────────────────────────

let _timer: ReturnType<typeof setTimeout> | null = null;

function tick() {
  const { privacyMode } = getStore();
  if (!privacyMode) {
    const available = SCENARIOS.filter(s => s.canRun());
    if (available.length) {
      const s = available[Math.floor(Math.random() * available.length)];
      const delay = s.minMs + Math.random() * (s.maxMs - s.minMs);
      _timer = setTimeout(() => { s.run(); tick(); }, delay);
    } else {
      _timer = setTimeout(tick, 4000);
    }
  } else {
    _timer = setTimeout(tick, 3000);
  }
}

export function startEngine() {
  if (_timer) return;
  _timer = setTimeout(tick, 5000);
}

export function stopEngine() {
  if (_timer) { clearTimeout(_timer); _timer = null; }
}

// ── CHAT RESPONSE ENGINE ──────────────────────────────────────────────────────

export function getSentinelResponse(input: string): string {
  const { household, events, armed, cameras } = getStore();
  const q = input.toLowerCase();

  const home = household.filter(m => m.status === 'home');
  const away = household.filter(m => m.status === 'away');

  if (q.match(/who.*(home|here|inside)/)) {
    if (home.length === 0) return 'Nobody is home right now. The house is empty. All exterior doors are locked.';
    if (away.length === 0) return `Everyone is home — ${home.map(m => m.name).join(', ')}.`;
    return `${home.map(m => m.name).join(' and ')} ${home.length === 1 ? 'is' : 'are'} home. ${away.map(m => m.name).join(' and ')} ${away.length === 1 ? 'is' : 'are'} out.`;
  }

  if (q.match(/lock|door(s)?/)) {
    return 'All exterior doors are locked. I\'ll alert you the moment any door opens.';
  }

  if (q.match(/arm|disarm|alarm/)) {
    return armed
      ? 'System is armed. I\'m actively monitoring all cameras and entry points.'
      : 'System is currently disarmed. Motion detection is paused.';
  }

  if (q.match(/privacy/)) {
    return 'To activate privacy mode, use the toggle in the Profile tab. All cameras will pause immediately.';
  }

  if (q.match(/summary|today|what happened|recap/)) {
    const counts = events.slice(0, 20).reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1; return acc;
    }, {} as Record<string, number>);
    return `Recent activity: ${counts.family_arrival || 0} arrivals, ${counts.family_departure || 0} departures, ${counts.package_delivery || 0} deliveries, ${counts.unknown_person || 0} unknown visitors. Your home looks normal.`;
  }

  if (q.match(/package|delivery|porch/)) {
    const pkg = events.find(e => e.type === 'package_delivery');
    if (pkg) return `Last delivery was ${pkg.body}. It's been on the porch since ${pkg.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}.`;
    return 'No deliveries detected in the last 24 hours.';
  }

  if (q.match(/camera(s)?|feed|footage/)) {
    const active = cameras.filter(c => c.status === 'active').length;
    return `${active} of ${cameras.length} cameras are online. No motion currently active. ${cameras.sort((a, b) => b.detectionCount - a.detectionCount)[0].name} has the most activity today.`;
  }

  if (q.match(/michael|sarah|emma|jake/)) {
    const name = q.match(/michael|sarah|emma|jake/)?.[0] ?? '';
    const member = household.find(m => m.id === name);
    if (member) {
      const status = member.status === 'home' ? 'currently home' : `out — last seen ${member.lastSeen.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
      return `${member.name} is ${status}.`;
    }
  }

  if (q.match(/threat|danger|emergency|break.?in/)) {
    return 'No active threats detected. If you suspect an emergency, I can contact emergency services immediately. Say "call 911" to initiate.';
  }

  if (q.match(/thank/)) {
    return "Always here. Your home is in good hands.";
  }

  if (q.match(/hello|hi |hey/)) {
    const h = home.length ? `${home[0].name} is home right now.` : 'Home is currently empty.';
    return `Hi. All systems running. ${h} What can I help with?`;
  }

  const defaults = [
    'Monitoring your home continuously. Everything looks normal right now.',
    'All cameras are clear. No unusual activity detected.',
    'Your home is secure. I\'ll alert you the moment anything changes.',
    'Running continuous analysis across all 4 cameras. Nothing unusual to report.',
    'I\'ve got your home covered. What would you like to know?',
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}
