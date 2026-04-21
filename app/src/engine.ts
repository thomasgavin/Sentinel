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
function resetOrb(delay = 4500) {
  setTimeout(() => {
    const anyHome = getStore().household.some(m => m.status === 'home');
    getStore().setOrbState(anyHome ? 'family' : 'idle');
  }, delay);
}
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
    minMs: 6000, maxMs: 12000,
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
    },
  },
  // Jake departs
  {
    id: 'jake_depart',
    minMs: 6000, maxMs: 12000,
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
      setTimeout(() => {
        const anyHome = getStore().household.some(m => m.status === 'home');
        getStore().setOrbState(anyHome ? 'family' : 'idle');
      }, 500);
    },
  },
  // Emma arrives
  {
    id: 'emma_arrive',
    minMs: 6000, maxMs: 12000,
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
    },
  },
  // Emma departs
  {
    id: 'emma_depart',
    minMs: 6000, maxMs: 12000,
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
      setTimeout(() => {
        const anyHome = getStore().household.some(m => m.status === 'home');
        getStore().setOrbState(anyHome ? 'family' : 'idle');
      }, 500);
    },
  },
  // Michael arrives
  {
    id: 'michael_arrive',
    minMs: 8000, maxMs: 15000,
    canRun: () => getStore().household.find(m => m.id === 'michael')?.status === 'away',
    run: () => {
      const t = new Date();
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
    },
  },
  // Michael departs
  {
    id: 'michael_depart',
    minMs: 8000, maxMs: 15000,
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
      setTimeout(() => {
        const anyHome = getStore().household.some(m => m.status === 'home');
        getStore().setOrbState(anyHome ? 'family' : 'idle');
      }, 500);
    },
  },
  // Package delivery
  {
    id: 'package',
    minMs: 12000, maxMs: 25000,
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
    minMs: 8000, maxMs: 15000,
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
        text: `Unknown person at your front door — ${fmt(t)}. No face match. They've been standing there for about a minute. Do you recognise them?`,
        time: new Date(t.getTime() + 1500), color: 'orange', hasClip: true,
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
        addEvent(re); resetOrb(0);
        addChat({ id: uid(), from: 'sentinel', text: "They've left. Clip saved. No further action taken.", time: new Date(), color: 'cyan' });
      }, resolveDelay);
    },
  },
  // Background motion — briefly flashes scanning face then resolves
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
      setOrb('unknown');
      addEvent({
        id: uid(), type: 'motion_resolved',
        title: 'Motion resolved',
        body: `${reason} · No person detected · ${cam}`,
        time: new Date(), camera: cam, resolved: true, severity: 'info',
      });
      resetOrb(2500);
    },
  },
  // Threat
  {
    id: 'threat',
    minMs: 40000, maxMs: 70000,
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
        text: "⚠️ Possible break-in — back door. Unusual entry attempt detected. 60-second response window is open. I can contact emergency services immediately. Tap to cancel if this is a false alarm.",
        time: new Date(t.getTime() + 1000), color: 'red', hasClip: true,
      });
      setTimeout(() => {
        resetOrb(0);
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
    minMs: 20000, maxMs: 40000,
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
  const t = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const home = household.filter(m => m.status === 'home');
  const away = household.filter(m => m.status === 'away');

  if (q.match(/who.*(home|here|inside|in)/)) {
    if (home.length === 0) return "Nobody's home right now — the house is empty. All entry points are locked and I'm in full monitoring mode.";
    if (away.length === 0) return `Everyone's home — ${home.map(m => m.name).join(', ')}. All cameras are quiet.`;
    return `${home.map(m => m.name).join(' and ')} ${home.length === 1 ? 'is' : 'are'} home right now. ${away.map(m => m.name).join(' and ')} ${away.length === 1 ? 'is' : 'are'} out. I'll notify you the moment anyone returns.`;
  }

  if (q.match(/safe|secure|okay|ok|alright|all good/)) {
    const threats = events.filter(e => e.type === 'threat' && !e.resolved);
    if (threats.length) return "There's an active alert I'm tracking. Check the feed — I've flagged it. Everything else is clear.";
    return home.length
      ? `Yes — ${home.map(m => m.name).join(' and ')} ${home.length === 1 ? 'is' : 'are'} home and all cameras are clear. No unusual activity in the last hour.`
      : "House is empty but secure. Doors locked, cameras active, no unusual activity. I've got it covered.";
  }

  if (q.match(/lock|door(s)?/)) {
    return "All exterior doors are locked. I'm watching every entry point continuously — you'll get an instant alert the moment anything changes.";
  }

  if (q.match(/arm|disarm|alarm/)) {
    return armed
      ? "System is armed. I'm running full analysis across all four cameras and all entry sensors. Nothing gets past me right now."
      : "System is disarmed. Motion detection is paused. You can re-arm anytime from the main screen.";
  }

  if (q.match(/privacy/)) {
    return "Privacy mode pauses all cameras immediately — no recording, no analysis. You can toggle it in the Profile tab. I'll resume the moment you switch it off.";
  }

  if (q.match(/summary|today|what happened|recap|report/)) {
    const counts = events.slice(0, 30).reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1; return acc;
    }, {} as Record<string, number>);
    const unknown = counts.unknown_person || 0;
    const threats = counts.threat || 0;
    const parts = [
      `${counts.family_arrival || 0} arrivals, ${counts.family_departure || 0} departures`,
      counts.package_delivery ? `${counts.package_delivery} ${counts.package_delivery === 1 ? 'delivery' : 'deliveries'}` : null,
      unknown ? `${unknown} unknown ${unknown === 1 ? 'visitor' : 'visitors'} — clips saved` : null,
      threats ? `${threats} threat ${threats === 1 ? 'alert' : 'alerts'}` : null,
    ].filter(Boolean);
    return `Here's what I've tracked: ${parts.join(', ')}. ${threats || unknown ? "I'd recommend reviewing the flagged clips." : "Nothing out of the ordinary."}`;
  }

  if (q.match(/package|delivery|parcel|porch/)) {
    const pkgs = events.filter(e => e.type === 'package_delivery');
    if (!pkgs.length) return "No deliveries detected yet today. I'll message you the moment anything arrives.";
    const last = pkgs[0];
    return `Last delivery was at ${t(last.time)} — ${last.body}. ${pkgs.length > 1 ? `${pkgs.length} total deliveries today.` : ''} I have footage saved if you need it.`;
  }

  if (q.match(/camera(s)?|feed|footage|video/)) {
    const active = cameras.filter(c => c.status === 'active').length;
    const busiest = [...cameras].sort((a, b) => b.detectionCount - a.detectionCount)[0];
    return `${active} of ${cameras.length} cameras online, all feeding live. ${busiest.name} has been the most active today with ${busiest.detectionCount} detections. Want me to pull up any specific feed?`;
  }

  const nameMatch = q.match(/michael|sarah|emma|jake/);
  if (nameMatch) {
    const member = household.find(m => m.id === nameMatch[0]);
    if (member) {
      const recentEvents = events.filter(e => e.personId === member.id).slice(0, 1)[0];
      const lastActivity = recentEvents ? ` Last seen at ${t(recentEvents.time)} — ${recentEvents.title.toLowerCase()}.` : '';
      return member.status === 'home'
        ? `${member.name} is home.${lastActivity}`
        : `${member.name} is out right now. Last seen at ${t(member.lastSeen)}.${lastActivity} I'll notify you when they're back.`;
    }
  }

  if (q.match(/threat|danger|emergency|break.?in|intrud/)) {
    const active = events.find(e => e.type === 'threat' && !e.resolved);
    if (active) return `There's an active threat alert. ${active.body}. I'm monitoring closely — respond or I'll escalate in 60 seconds.`;
    return "No active threats right now. If you sense something's wrong, say 'call 911' and I'll connect emergency services immediately.";
  }

  if (q.match(/unknown|stranger|visitor|suspicious/)) {
    const recent = events.filter(e => e.type === 'unknown_person').slice(0, 1)[0];
    if (recent) return `Last unidentified visitor was at ${t(recent.time)}. ${recent.body}. Clip is saved — I can pull it up.`;
    return "No unidentified visitors in recent history. If someone suspicious shows up, I'll alert you instantly and start recording.";
  }

  if (q.match(/motion|movement/)) {
    const motionCams = cameras.filter(c => c.motionActive);
    if (motionCams.length) return `Active motion on ${motionCams.map(c => c.name).join(' and ')} right now. I'm analysing — no person detected yet.`;
    return "No active motion on any camera right now. Everything's still.";
  }

  if (q.match(/thank/)) {
    return "Always here. Stay safe.";
  }

  if (q.match(/hello|hi\b|hey\b|morning|evening/)) {
    const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
    const status = home.length ? `${home.map(m => m.name).join(' and ')} ${home.length === 1 ? 'is' : 'are'} home.` : "House is empty right now.";
    return `${greeting}. All systems running. ${status} What do you need?`;
  }

  if (q.match(/call 911|emergency services|police/)) {
    return "Understood. In a real emergency I would contact emergency services immediately and share your home address and camera feed. Right now no active threat is detected — are you sure you want to proceed?";
  }

  const defaults = [
    home.length
      ? `Everything's quiet. ${home.map(m => m.name).join(' and ')} ${home.length === 1 ? 'is' : 'are'} home and all cameras are clear.`
      : "House is empty — I'm in full monitoring mode. All entry points locked and cameras active.",
    "Nothing unusual to report. I'm running continuous analysis across all cameras.",
    `All ${cameras.filter(c => c.status === 'active').length} cameras are online and feeding live. No alerts.`,
    "Your home is secure. I'll surface anything the moment it happens — what else can I help with?",
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}
