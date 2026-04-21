import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Animated, StatusBar, Modal, Pressable, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { Orb } from '../components/Orb';
import { C, getColors, getStateColor, getEventColor, STATE_LABEL, EVENT_COLOR, EVENT_BG, EVENT_ICON } from '../theme';
import { SentinelEvent } from '../types';

const relTime = (d: Date): string => {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 10) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
};

// ── EVENT DETAIL MODAL ─────────────────────────────────────────────────────

function fakeEventMeta(event: SentinelEvent) {
  const seed = event.time.getTime() % 1000;
  const frames = 80 + (seed % 820);
  const totalSec = Math.floor(frames / (10 + (seed % 10)));
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return {
    duration:   mins > 0 ? `${mins}m ${secs}s` : `${secs}s`,
    frames,
    confidence: 76 + (seed % 22),
  };
}

const EventDetailModal: React.FC<{ event: SentinelEvent | null; onClose: () => void }> = ({ event, onClose }) => {
  const slideY   = useRef(new Animated.Value(500)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (event) {
      Animated.parallel([
        Animated.spring(slideY,   { toValue: 0, useNativeDriver: true, tension: 68, friction: 11 }),
        Animated.timing(backdrop, { toValue: 1, duration: 220,         useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideY,   { toValue: 500, duration: 240, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 0,   duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [!!event]);

  if (!event) return null;

  const color    = EVENT_COLOR[event.type] ?? C.t2;
  const bg       = EVENT_BG[event.type]    ?? 'rgba(255,255,255,0.04)';
  const icon     = EVENT_ICON[event.type]  ?? 'ellipse';
  const meta     = fakeEventMeta(event);
  const sevColor = event.severity === 'alert' ? C.red : event.severity === 'warning' ? C.orange : C.accent;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose}>
      <Animated.View style={[ms.backdrop, { opacity: backdrop }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[ms.sheet, { transform: [{ translateY: slideY }] }]}>
          <View style={ms.handle} />
          <View style={ms.header}>
            <TouchableOpacity style={ms.closeBtn} onPress={onClose}>
              <Ionicons name="chevron-down" size={22} color={C.t2} />
            </TouchableOpacity>
            <View style={[ms.sevChip, { backgroundColor: `${sevColor}18`, borderColor: `${sevColor}50` }]}>
              <Text style={[ms.sevText, { color: sevColor }]}>{event.severity.toUpperCase()}</Text>
            </View>
          </View>
          <View style={[ms.iconCircle, { backgroundColor: bg, borderColor: `${color}40` }]}>
            <Ionicons name={icon as any} size={42} color={color} />
          </View>
          <Text style={ms.title}>{event.title}</Text>
          <Text style={ms.body}>{event.body}</Text>
          <View style={ms.grid}>
            {([
              ['CAMERA',     event.camera,      'videocam-outline'],
              ['TIME',       event.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 'time-outline'],
              ['DURATION',   meta.duration,     'timer-outline'],
              ['FRAMES',     `${meta.frames} captured`, 'film-outline'],
              ['CONFIDENCE', `${meta.confidence}%`, 'analytics-outline'],
              ['RESOLVED',   event.resolved ? 'Yes' : 'Monitoring', 'shield-checkmark-outline'],
            ] as [string, string, string][]).map(([label, val, ic]) => (
              <View key={label} style={ms.gridRow}>
                <Ionicons name={ic as any} size={15} color={C.t3} style={{ width: 22 }} />
                <View>
                  <Text style={ms.gridLabel}>{label}</Text>
                  <Text style={ms.gridValue}>{val}</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={ms.actions}>
            <TouchableOpacity style={[ms.primaryBtn, { backgroundColor: `${color}1a`, borderColor: `${color}50` }]}>
              <Ionicons name="play" size={16} color={color} />
              <Text style={[ms.primaryBtnText, { color }]}>View Footage</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ms.secondaryBtn} onPress={onClose}>
              <Text style={ms.secondaryBtnText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ── ANIMATED EVENT ROW ─────────────────────────────────────────────────────

const AnimatedEventRow: React.FC<{
  event: SentinelEvent;
  onPress: (e: SentinelEvent) => void;
}> = ({ event, onPress }) => {
  const { isDark } = useStore();
  const col  = getColors(isDark);
  const isNew  = Date.now() - event.time.getTime() < 6000;
  const slideX = useRef(new Animated.Value(isNew ? 60 : 0)).current;
  const fadeIn = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const flash  = useRef(new Animated.Value(0)).current;

  const color = getEventColor(event.type, isDark);
  const bg    = EVENT_BG[event.type] ?? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)');
  const icon  = EVENT_ICON[event.type]  ?? 'ellipse';

  useEffect(() => {
    if (!isNew) return;
    Animated.parallel([
      Animated.spring(slideX, { toValue: 0, useNativeDriver: true, tension: 62, friction: 10 }),
      Animated.timing(fadeIn, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.timing(flash, { toValue: 1, duration: 150, useNativeDriver: false }),
      Animated.timing(flash, { toValue: 0, duration: 700, useNativeDriver: false }),
    ]).start();
  }, []);

  const flashBg = flash.interpolate({ inputRange: [0, 1], outputRange: ['rgba(0,0,0,0)', `${color}20`] });

  return (
    <Animated.View style={{ transform: [{ translateX: slideX }], opacity: fadeIn }}>
      <Animated.View style={{ backgroundColor: flashBg }}>
        <TouchableOpacity
          style={[styles.feedRow, { borderLeftColor: color }]}
          onPress={() => onPress(event)}
          activeOpacity={0.7}
        >
          <View style={[styles.feedIcon, { backgroundColor: bg }]}>
            <Ionicons name={icon as any} size={15} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.feedTitle, { color: col.text }]} numberOfLines={1}>{event.title}</Text>
            <Text style={[styles.feedTime, { color: col.t2 }]}>{relTime(event.time)}</Text>
          </View>
          {event.severity !== 'info' && !event.resolved && (
            <View style={[styles.feedDot, { backgroundColor: event.severity === 'alert' ? col.red : col.orange }]} />
          )}
          <Ionicons name="chevron-forward" size={12} color={col.t3} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

// ── HOME SCREEN ────────────────────────────────────────────────────────────

export const HomeScreen: React.FC = () => {
  const {
    orbState, events, household, cameras, armed, privacyMode,
    toggleArmed, togglePrivacy, setOrbState, toggleCamera,
    banner, isDark, showBanner, hideBanner, addEvent,
  } = useStore();
  const col = getColors(isDark);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [selectedEvent, setSelectedEvent] = useState<SentinelEvent | null>(null);
  const [orbLookUp,     setOrbLookUp]     = useState(false);
  const [now,           setNow]           = useState(new Date());
  const [demoVisible,   setDemoVisible]   = useState(false);
  const secretTaps  = useRef(0);
  const secretTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const lastEventId   = useRef<string | null>(null);
  const isFirstRender = useRef(true);
  const lookupEventId = useRef<string | null>(null);

  const stateColor  = getStateColor(orbState, isDark);
  const stateLabel  = STATE_LABEL[orbState] ?? 'Monitoring';
  const homeMembers = household.filter(m => m.status === 'home');
  const recentFeed  = events.slice(0, 8);

  const armScale   = useRef(new Animated.Value(1)).current;
  const privScale  = useRef(new Animated.Value(1)).current;
  const scanY      = useRef(new Animated.Value(0)).current;
  const borderGlow = useRef(new Animated.Value(0.3)).current;
  const stateFlash = useRef(new Animated.Value(0)).current;
  const promptFade  = useRef(new Animated.Value(1)).current;
  const bannerSlide = useRef(new Animated.Value(-90)).current;
  const bannerFade  = useRef(new Animated.Value(0)).current;
  const [notifEvent, setNotifEvent] = useState<SentinelEvent | null>(null);
  const [notifText,  setNotifText]  = useState('');

  // Scan line
  useEffect(() => {
    const a = Animated.loop(Animated.timing(scanY, { toValue: 1, duration: 2800, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, []);

  // Border glow pulse
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(borderGlow, { toValue: 0.85, duration: 1100, useNativeDriver: true }),
      Animated.timing(borderGlow, { toValue: 0.3,  duration: 1100, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, []);

  // Flash on state change
  useEffect(() => {
    Animated.sequence([
      Animated.timing(stateFlash, { toValue: 1, duration: 110, useNativeDriver: true }),
      Animated.timing(stateFlash, { toValue: 0, duration: 480, useNativeDriver: true }),
    ]).start();
  }, [orbState]);

  // Orb look-up trigger on arrivals/departures
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastEventId.current   = events[0]?.id ?? null;
      return;
    }
    const latest = events[0];
    if (!latest || latest.id === lastEventId.current) return;
    lastEventId.current = latest.id;

    if ((latest.type === 'family_arrival' || latest.type === 'family_departure') && latest.id !== lookupEventId.current) {
      lookupEventId.current = latest.id;
      setOrbLookUp(true);
      setTimeout(() => setOrbLookUp(false), 3000);
    }
  }, [events]);

  // Prompt box cross-fade + overlay banner
  useEffect(() => {
    if (banner.visible && banner.event) {
      const e = banner.event;
      const home = household.filter(m => m.status === 'home');
      let text = e.title;
      if (e.type === 'family_departure') {
        text = home.length === 0
          ? `${e.title} · Home is now empty`
          : `${e.title} · ${home.length} still home`;
      } else if (e.type === 'family_arrival') {
        text = `${e.title} · ${home.length} of ${household.length} home`;
      } else if (e.type === 'package_delivery') {
        text = `${e.title} · Left on porch`;
      } else if (e.type === 'unknown_person') {
        text = `${e.title} · Stay alert`;
      } else if (e.type === 'threat') {
        text = `${e.title} · Response window open`;
      }
      setNotifText(text);
      setNotifEvent(e);
      // Prompt box: fade to notification
      Animated.timing(promptFade, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      // Overlay banner: spring in from top
      Animated.parallel([
        Animated.spring(bannerSlide, { toValue: 0, useNativeDriver: true, tension: 72, friction: 11 }),
        Animated.timing(bannerFade,  { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      // Prompt box: fade back to default
      Animated.timing(promptFade, { toValue: 1, duration: 300, useNativeDriver: true })
        .start(() => { setNotifEvent(null); setNotifText(''); });
      // Overlay banner: slide out upward
      Animated.parallel([
        Animated.timing(bannerSlide, { toValue: -90, duration: 260, useNativeDriver: true }),
        Animated.timing(bannerFade,  { toValue: 0,   duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [banner.visible]);

  const handleSecretTap = () => {
    secretTaps.current += 1;
    if (secretTimer.current) clearTimeout(secretTimer.current);
    secretTimer.current = setTimeout(() => { secretTaps.current = 0; }, 1800);
    if (secretTaps.current >= 3) {
      secretTaps.current = 0;
      setDemoVisible(true);
    }
  };

  const DEMO_STATES: { label: string; state: import('../types').OrbState; color: string }[] = [
    { label: 'Monitoring',     state: 'idle',    color: C.accent },
    { label: 'Family home',    state: 'family',  color: C.green  },
    { label: 'Unknown person', state: 'unknown', color: C.orange },
    { label: 'Threat',         state: 'threat',  color: C.red    },
    { label: 'Privacy mode',   state: 'privacy', color: C.t2     },
  ];

  const fireSystemBanner = (title: string, body: string, prefix: string) => {
    const e: SentinelEvent = {
      id: `sys-${prefix}-${Date.now()}`,
      type: 'system',
      title,
      body,
      time: new Date(),
      camera: 'System',
      severity: 'info',
      resolved: true,
    };
    addEvent(e);
    showBanner(e);
    setTimeout(() => hideBanner(), 4500);
  };

  const handleArm = () => {
    Animated.sequence([
      Animated.timing(armScale, { toValue: 0.88, duration: 65,  useNativeDriver: true }),
      Animated.timing(armScale, { toValue: 1,    duration: 130, useNativeDriver: true }),
    ]).start();
    const isArming = !armed;
    toggleArmed();
    setOrbLookUp(true);
    setTimeout(() => setOrbLookUp(false), 2500);
    if (isArming) {
      fireSystemBanner(
        'System Armed · All entry points monitored',
        'Sentinel is actively watching all cameras and sensors.',
        'arm',
      );
    } else {
      fireSystemBanner(
        'System Disarmed · Alerts paused',
        'Security monitoring has been suspended.',
        'disarm',
      );
    }
  };

  const handlePrivacy = () => {
    Animated.sequence([
      Animated.timing(privScale, { toValue: 0.88, duration: 65,  useNativeDriver: true }),
      Animated.timing(privScale, { toValue: 1,    duration: 130, useNativeDriver: true }),
    ]).start();
    const isEnabling = !privacyMode;
    togglePrivacy();
    setOrbLookUp(true);
    setTimeout(() => setOrbLookUp(false), 2500);
    if (isEnabling) {
      fireSystemBanner(
        'Privacy Mode On · All cameras paused',
        'Cameras are off. Sentinel is in passive standby.',
        'priv-on',
      );
    } else {
      fireSystemBanner(
        'Privacy Mode Off · Cameras resumed',
        'All cameras are back online and monitoring.',
        'priv-off',
      );
    }
  };

  const FEED_H = 340;
  const scanTranslate = scanY.interpolate({ inputRange: [0, 1], outputRange: [0, FEED_H] });

  const statsData = [
    { label: 'MOVEMENTS',  val: events.filter(e => e.type === 'family_arrival' || e.type === 'family_departure').length,  color: col.text },
    { label: 'DELIVERIES', val: events.filter(e => e.type === 'package_delivery').length,   color: col.accent },
    { label: 'UNKNOWN',    val: events.filter(e => e.type === 'unknown_person').length,      color: events.filter(e => e.type === 'unknown_person').length  > 0 ? col.orange : col.text },
    { label: 'THREATS',    val: events.filter(e => e.type === 'threat').length,              color: events.filter(e => e.type === 'threat').length > 0 ? col.red : col.green },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: col.bg }]}>
      <StatusBar barStyle="light-content" />

      {/* State edge flash */}
      <Animated.View
        pointerEvents="none"
        style={[styles.edgeFlash, { borderColor: stateColor, opacity: stateFlash }]}
      />

      {/* ── NAV ── */}
      <View style={[styles.nav, { borderBottomColor: `${stateColor}50` }]}>
        <TouchableOpacity style={styles.navLeft} onPress={handleSecretTap} activeOpacity={1}>
          <Animated.View style={[styles.navOrb, {
            backgroundColor: stateColor,
            shadowColor: stateColor,
            opacity: borderGlow,
          }]} />
          <Text style={[styles.navTitle, { color: col.text }]}>SENTINEL</Text>
        </TouchableOpacity>
        <View style={styles.navButtons}>
          <Animated.View style={{ transform: [{ scale: privScale }] }}>
            <TouchableOpacity
              style={[styles.navBtn, privacyMode
                ? { borderColor: `${col.t2}55`, backgroundColor: isDark ? 'rgba(10,10,18,0.90)' : 'rgba(0,0,0,0.80)' }
                : { borderColor: col.border2, backgroundColor: isDark ? col.s2 : 'rgba(0,0,0,0.07)' }
              ]}
              onPress={handlePrivacy}
              activeOpacity={0.75}
            >
              <Ionicons name={privacyMode ? 'eye-off' : 'eye-outline'} size={14} color={privacyMode ? col.t2 : col.t3} />
              <Text style={[styles.navBtnText, { color: privacyMode ? col.t2 : col.t3 }]}>
                {privacyMode ? 'Private' : 'Cameras'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: armScale }] }}>
            <TouchableOpacity
              style={[styles.navBtn, armed
                ? { borderColor: `${C.green}55`, backgroundColor: 'rgba(4,10,6,0.90)' }
                : { borderColor: col.border2, backgroundColor: isDark ? col.s2 : 'rgba(0,0,0,0.07)' }
              ]}
              onPress={handleArm}
              activeOpacity={0.75}
            >
              <Ionicons name={armed ? 'shield-checkmark' : 'shield-outline'} size={14} color={armed ? C.green : col.t2} />
              <Text style={[styles.navBtnText, { color: armed ? C.green : col.t2 }]}>
                {armed ? 'Armed' : 'Disarmed'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ── HERO ── */}
        <View style={[styles.heroCard, { borderColor: `${stateColor}30`, backgroundColor: col.s1 }]}>
          {/* Orb */}
          <View style={styles.orbWrap}>
            <Orb state={orbState} size={150} lookUp={orbLookUp} />
          </View>

          {/* Clock */}
          <Text style={[styles.clockTime, { color: col.text }]}>
            {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </Text>
          <Text style={[styles.clockDate, { color: col.t3 }]}>
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>

          {/* State label */}
          <Text style={[styles.stateLabel, { color: stateColor }]}>{stateLabel}</Text>
          <Text style={[styles.stateSub, { color: col.t2 }]}>
            {homeMembers.length > 0
              ? `${homeMembers.map(m => m.name).join(' · ')} home`
              : 'Home is empty — monitoring all entry points'}
          </Text>

          {/* Household members */}
          <View style={styles.memberRow}>
            {household.map(m => (
              <View key={m.id} style={styles.memberCell}>
                <View style={[styles.memberAvatar, {
                  backgroundColor: m.status === 'home' ? `${m.color}20` : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                  borderColor: m.status === 'home' ? `${m.color}cc` : col.border,
                }]}>
                  <Text style={[styles.memberInitial, { color: m.status === 'home' ? m.color : col.t3 }]}>{m.initials}</Text>
                </View>
                <Text style={[styles.memberName, { color: m.status === 'home' ? col.text : col.t3 }]}>{m.name}</Text>
                <View style={[styles.memberDot, { backgroundColor: m.status === 'home' ? col.green : col.t3 }]} />
              </View>
            ))}
          </View>

          {/* Quick chat prompt — cross-fades to notification text when banner fires */}
          <TouchableOpacity
            style={[styles.chatPrompt, { borderColor: `${stateColor}30`, backgroundColor: `${stateColor}0a` }]}
            onPress={() => (navigation as any).navigate('Chat')}
            activeOpacity={0.7}
          >
            {/* Default: Ask Sentinel */}
            <Animated.View style={[styles.chatRow, { opacity: promptFade }]} pointerEvents="none">
              <Ionicons name="chatbubble-ellipses" size={16} color={stateColor} />
              <Text style={[styles.chatPromptText, { color: stateColor }]}>Ask Sentinel anything...</Text>
              <Ionicons name="arrow-forward" size={14} color={stateColor} />
            </Animated.View>
            {/* Notification state: event title */}
            <Animated.View
              style={[styles.chatRow, styles.chatRowAbs, {
                opacity: promptFade.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
              }]}
              pointerEvents="none"
            >
              {notifEvent && (
                <>
                  <Ionicons
                    name={(EVENT_ICON[notifEvent.type] ?? 'alert-circle') as any}
                    size={16}
                    color={EVENT_COLOR[notifEvent.type] ?? stateColor}
                  />
                  <Text
                    style={[styles.chatPromptText, { color: EVENT_COLOR[notifEvent.type] ?? stateColor }]}
                    numberOfLines={1}
                  >
                    {notifText}
                  </Text>
                  <View style={[styles.notifDot, { backgroundColor: EVENT_COLOR[notifEvent.type] ?? stateColor }]} />
                </>
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* ── STATS ── */}
        <View style={[styles.statsCard, { backgroundColor: col.statsBg, borderColor: col.border }]}>
          {statsData.map((s, i) => (
            <React.Fragment key={s.label}>
              <View style={styles.statCell}>
                <Text style={[styles.statNum, { color: s.color }]}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
              {i < 3 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── LIVE FEED ── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={styles.sectionLeft}>
              <View style={styles.livePip} />
              <Text style={[styles.sectionTitle, { color: stateColor }]}>LIVE FEED</Text>
            </View>
            <Text style={styles.sectionSub}>{recentFeed.length} events</Text>
          </View>
          <View style={[styles.feedCard, { backgroundColor: col.feedBg, height: FEED_H, borderColor: `${stateColor}22` }]}>
            {/* Scan line from top */}
            <Animated.View
              pointerEvents="none"
              style={[styles.scanLine, { backgroundColor: stateColor, transform: [{ translateY: scanTranslate }] }]}
            />
            {recentFeed.map(ev => (
              <AnimatedEventRow key={ev.id} event={ev} onPress={setSelectedEvent} />
            ))}
          </View>
        </View>

        {/* ── CAMERAS ── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: stateColor }]}>CAMERAS</Text>
            <Text style={styles.sectionSub}>{cameras.filter(c => c.status === 'active').length} of {cameras.length} online</Text>
          </View>
          <View style={styles.camGrid}>
            {cameras.map(cam => {
              const isOff = cam.status === 'offline';
              return (
              <TouchableOpacity
                key={cam.id}
                style={[styles.camCard, {
                  backgroundColor: isOff ? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)') : col.camBg,
                  borderColor: cam.motionActive ? `${col.orange}55` : isOff ? col.border : `${stateColor}25`,
                  opacity: isOff ? 0.6 : 1,
                }]}
                onPress={() => toggleCamera(cam.id)}
                activeOpacity={0.75}
              >
                <View style={styles.camTopRow}>
                  <Text style={[styles.camName, { color: isOff ? col.t3 : col.text }]}>{cam.name}</Text>
                  <View style={[styles.camBadge, {
                    backgroundColor: cam.motionActive ? `${col.orange}22` : (cam.status === 'active' ? `${col.green}18` : `${col.border}44`),
                  }]}>
                    <View style={[styles.camDot, { backgroundColor: cam.motionActive ? col.orange : (cam.status === 'active' ? col.green : col.t3) }]} />
                    <Text style={[styles.camBadgeText, { color: cam.motionActive ? col.orange : (cam.status === 'active' ? col.green : col.t3) }]}>
                      {cam.motionActive ? 'MOTION' : cam.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.camLoc, { color: isOff ? col.t3 : col.t2 }]}>{cam.location}</Text>
                <Text style={[styles.camLast, { color: col.t3 }]} numberOfLines={1}>
                  {isOff ? 'Tap to re-enable' : cam.lastEvent}
                </Text>
              </TouchableOpacity>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* ── DEMO MODE PICKER ── */}
      {demoVisible && (
        <Modal transparent animationType="fade" onRequestClose={() => setDemoVisible(false)}>
          <Pressable style={ms.backdrop} onPress={() => setDemoVisible(false)}>
            <View style={styles.demoSheet}>
              <Text style={styles.demoTitle}>Demo Mode</Text>
              {DEMO_STATES.map(d => (
                <TouchableOpacity
                  key={d.state}
                  style={[styles.demoBtn, { borderColor: `${d.color}50`, backgroundColor: `${d.color}12` }]}
                  onPress={() => { setOrbState(d.state); setDemoVisible(false); }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.demoDot, { backgroundColor: d.color }]} />
                  <Text style={[styles.demoBtnText, { color: d.color }]}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      )}

      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />

      {/* ── OVERLAY NOTIFICATION BANNER ── */}
      {notifEvent && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.overlayBanner,
            {
              top: insets.top + 56,
              transform: [{ translateY: bannerSlide }],
              opacity: bannerFade,
              backgroundColor: col.s1,
              borderColor: `${getEventColor(notifEvent.type, isDark)}55`,
              shadowColor: getEventColor(notifEvent.type, isDark),
            },
          ]}
        >
          <View style={[styles.overlayIcon, { backgroundColor: `${getEventColor(notifEvent.type, isDark)}20` }]}>
            <Ionicons
              name={(EVENT_ICON[notifEvent.type] ?? 'alert-circle') as any}
              size={15}
              color={getEventColor(notifEvent.type, isDark)}
            />
          </View>
          <Text style={[styles.overlayText, { color: getEventColor(notifEvent.type, isDark) }]} numberOfLines={2}>
            {notifText}
          </Text>
          <View style={[styles.overlayDot, { backgroundColor: getEventColor(notifEvent.type, isDark) }]} />
        </Animated.View>
      )}
    </View>
  );
};

// ── STYLES ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  overlayBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  overlayIcon: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  overlayText: { flex: 1, fontSize: 13, fontWeight: '700' },
  overlayDot:  { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },

  edgeFlash: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    zIndex: 999,
  } as any,

  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  navLeft:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navOrb:     { width: 12, height: 12, borderRadius: 6, shadowRadius: 8, shadowOpacity: 1, shadowOffset: { width: 0, height: 0 } },
  navTitle:   { color: C.text, fontSize: 18, fontWeight: '900', letterSpacing: 2.5 },
  navButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1,
  },
  navBtnText: { fontSize: 12, fontWeight: '700' },

  scroll:  { flex: 1 },
  content: { paddingHorizontal: 16, gap: 16, paddingTop: 16 },

  // Hero
  heroCard: {
    backgroundColor: C.s1,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 20,
    overflow: 'visible',
  },
  orbWrap:    { marginBottom: 4 },
  clockTime:  { color: C.text, fontSize: 36, fontWeight: '200', letterSpacing: 1, marginTop: 4 },
  clockDate:  { color: C.t3, fontSize: 13, fontWeight: '500', marginTop: 2, marginBottom: 4, letterSpacing: 0.5 },
  stateLabel: { fontSize: 22, fontWeight: '900', marginTop: 4, textAlign: 'center', letterSpacing: 0.3 },
  stateSub:   { color: C.t2, fontSize: 14, marginTop: 5, textAlign: 'center', lineHeight: 20 },

  // Members
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 22,
    marginBottom: 6,
  },
  memberCell:    { alignItems: 'center', gap: 5 },
  memberAvatar:  {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2,
  },
  memberInitial: { fontSize: 16, fontWeight: '900' },
  memberName:    { fontSize: 12, fontWeight: '600' },
  memberDot:     { width: 6, height: 6, borderRadius: 3 },

  // Chat prompt in hero
  chatPrompt: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginTop: 16,
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatRowAbs: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 0,
    bottom: 0,
  },
  chatPromptText: { flex: 1, fontSize: 15, fontWeight: '600' },
  notifDot: { width: 7, height: 7, borderRadius: 3.5 },

  // Stats
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 22,
    paddingHorizontal: 10,
  },
  statCell:    { flex: 1, alignItems: 'center', gap: 5 },
  statNum:     { fontSize: 38, fontWeight: '900' },
  statLabel:   { color: C.t3, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  statDivider: { width: 1, height: 40, backgroundColor: C.border },

  // Section
  section:     { gap: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  sectionTitle:{ fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  sectionSub:  { color: C.t3, fontSize: 13 },
  livePip:     { width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.red },

  // Feed
  feedCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1.5,
    opacity: 0.3,
    zIndex: 10,
  },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    paddingLeft: 10,
    gap: 10,
    borderLeftWidth: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  feedIcon:  { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  feedTitle: { color: C.text, fontSize: 16, fontWeight: '700' },
  feedTime:  { color: C.t2,   fontSize: 13, marginTop: 1 },
  feedDot:   { width: 7, height: 7, borderRadius: 3.5 },

  // Cameras
  camGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  camCard: {
    width: '48.5%', borderRadius: 18, borderWidth: 1, padding: 14, gap: 5,
  },
  camTopRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  camName:       { color: C.text, fontSize: 17, fontWeight: '800' },
  camLoc:        { color: C.t2,   fontSize: 13 },
  camLast:       { color: C.t3,   fontSize: 12, marginTop: 4 },
  camBadge:      { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 },
  camDot:        { width: 5, height: 5, borderRadius: 2.5 },
  camBadgeText:  { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },

  // Chat preview card
  chatCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: `${C.accent}30`,
    padding: 20,
    gap: 16,
  },
  chatCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chatMiniOrb: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  chatMiniOrbCore: { width: 14, height: 14, borderRadius: 7 },
  chatCardTitle:   { color: C.text, fontSize: 17, fontWeight: '800' },
  chatCardSub:     { color: C.t2,   fontSize: 13, marginTop: 2 },
  chatLiveBadge:   { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: `${C.red}18`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  chatLiveDot:     { width: 6, height: 6, borderRadius: 3, backgroundColor: C.red },
  chatLiveText:    { color: C.red, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  chatMsgPreview:  { backgroundColor: C.s2, borderRadius: 14, padding: 14, gap: 8 },
  chatMsgText:     { color: C.t2, fontSize: 15, lineHeight: 22 },
  chatMsgTime:     { color: C.t3, fontSize: 12 },
  chatCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  chatCTAText: { flex: 1, fontSize: 16, fontWeight: '800' },

  demoSheet: {
    backgroundColor: C.s1,
    borderRadius: 24,
    padding: 24,
    gap: 10,
    margin: 24,
    borderWidth: 1,
    borderColor: C.border2,
    marginTop: 'auto',
    marginBottom: 60,
  },
  demoTitle: { color: C.t3, fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  demoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1,
  },
  demoDot: { width: 8, height: 8, borderRadius: 4 },
  demoBtnText: { fontSize: 15, fontWeight: '700' },
});

// ── MODAL STYLES ───────────────────────────────────────────────────────────

const ms = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.s1,
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    padding: 24, paddingBottom: 44,
    borderWidth: 1, borderColor: C.border2,
  },
  handle:    { width: 38, height: 4, borderRadius: 2, backgroundColor: C.s4, alignSelf: 'center', marginBottom: 22 },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  closeBtn:  { width: 40, height: 40, borderRadius: 20, backgroundColor: C.s3, alignItems: 'center', justifyContent: 'center' },
  sevChip:   { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  sevText:   { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  iconCircle:{ width: 80, height: 80, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, alignSelf: 'center', marginBottom: 18 },
  title:     { color: C.text, fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  body:      { color: C.t2,   fontSize: 15, lineHeight: 23, textAlign: 'center', marginBottom: 24 },
  grid:      { backgroundColor: C.s2, borderRadius: 16, padding: 16, gap: 14, marginBottom: 24 },
  gridRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  gridLabel: { color: C.t3, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 2 },
  gridValue: { color: C.text, fontSize: 14, fontWeight: '700' },
  actions:   { flexDirection: 'row', gap: 10 },
  primaryBtn:{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, paddingVertical: 15, borderWidth: 1 },
  primaryBtnText: { fontSize: 15, fontWeight: '800' },
  secondaryBtn:   { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 15, backgroundColor: C.s3, borderWidth: 1, borderColor: C.border },
  secondaryBtnText: { color: C.t2, fontSize: 15, fontWeight: '700' },
});
