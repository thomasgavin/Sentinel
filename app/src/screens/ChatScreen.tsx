import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Animated, ListRenderItem, ScrollView, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { ChatMessage } from '../types';
import { getSentinelResponse } from '../engine';
import { C, getColors, getStateColor, ORB_GRADIENT } from '../theme';
import { watchUrl } from '../data/videoClips';

// clip IDs for unknown person vs threat messages
const CLIP_UNKNOWN = ['JOKBzzpoWnU', 'NtuKgCMqssY', 'JUfIpZCYquY', 'rqfMuInKHd0'];
const CLIP_THREAT  = ['JdU_xmAkbMo', 'WAIwZI-X7m4', 'VQqtS995yYo', 'xjQzg1QAlXs'];
function pickClip(pool: string[], seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return pool[h % pool.length];
}
import { LinearGradient } from 'expo-linear-gradient';

const fmt = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

const ACCENT: Record<string, string> = {
  cyan:   C.accent,
  green:  C.green,
  orange: C.orange,
  red:    C.red,
};

// ── TYPING INDICATOR ──────────────────────────────────────────────────────────

const TypingIndicator: React.FC = () => {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const anims = dots.map((v, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 160),
        Animated.timing(v, { toValue: 1,   duration: 280, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.2, duration: 280, useNativeDriver: true }),
        Animated.delay(480 - i * 160),
      ]))
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);

  return (
    <View style={s.row}>
      <SentinelAvatar />
      <View style={[s.bubbleSentinel, { paddingVertical: 14, paddingHorizontal: 16 }]}>
        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
          {dots.map((v, i) => (
            <Animated.View
              key={i}
              style={{
                width: 6, height: 6, borderRadius: 3,
                backgroundColor: C.accent, opacity: v,
                transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

// ── SENTINEL AVATAR ───────────────────────────────────────────────────────────

const SentinelAvatar: React.FC<{ color?: string }> = ({ color = C.accent }) => (
  <View style={[s.avatarRing, { borderColor: `${color}50` }]}>
    <View style={s.avatar}>
      <LinearGradient
        colors={ORB_GRADIENT.idle as [string, string, string, string]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0.1 }}
        end={{ x: 0.8, y: 1 }}
      />
      {/* Eye dots */}
      <View style={{ flexDirection: 'row', gap: 4, marginBottom: 1 }}>
        <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.9)' }} />
        <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.9)' }} />
      </View>
    </View>
  </View>
);

// ── MESSAGE BUBBLE ────────────────────────────────────────────────────────────

const MessageItem: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const { isDark } = useStore();
  const col = getColors(isDark);
  const isUser  = msg.from === 'user';
  const accent  = msg.color ? ACCENT[msg.color] ?? col.accent : col.accent;
  const isAlert = msg.color === 'orange' || msg.color === 'red';
  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideY  = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
    ]).start();
  }, []);

  if (isUser) {
    return (
      <Animated.View style={[s.row, s.rowUser, { opacity: fadeIn, transform: [{ translateY: slideY }] }]}>
        <LinearGradient
          colors={[`${C.accent}cc`, `${C.accent}88`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.bubbleUser]}
        >
          <Text style={s.textUser}>{msg.text}</Text>
          <Text style={s.metaUser}>{fmt(msg.time)}</Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[s.row, { opacity: fadeIn, transform: [{ translateY: slideY }] }]}>
      <SentinelAvatar color={accent} />
      <View style={s.bubbleCol}>
        <View style={[s.bubbleSentinel, {
          backgroundColor: col.s2,
          borderColor: `${accent}28`,
          borderLeftColor: `${accent}70`,
          borderLeftWidth: 2,
        }]}>
          {isAlert && (
            <View style={[s.alertBadge, { backgroundColor: `${accent}18` }]}>
              <Ionicons name={msg.color === 'red' ? 'warning' : 'eye'} size={10} color={accent} />
              <Text style={[s.alertBadgeText, { color: accent }]}>
                {msg.color === 'red' ? 'THREAT ALERT' : 'ATTENTION'}
              </Text>
            </View>
          )}
          <Text style={[s.textSentinel, { color: col.t2 }, isAlert && { color: col.text }]}>{msg.text}</Text>
          {msg.hasClip && (
            <TouchableOpacity
              style={[s.clipBtn, { borderColor: `${accent}50`, backgroundColor: `${accent}12` }]}
              activeOpacity={0.7}
              onPress={() => {
                const pool = msg.color === 'red' ? CLIP_THREAT : CLIP_UNKNOWN;
                Linking.openURL(watchUrl(pickClip(pool, msg.id)));
              }}
            >
              <Ionicons name="play-circle" size={14} color={accent} />
              <Text style={[s.clipBtnText, { color: accent }]}>View clip</Text>
              <Ionicons name="arrow-forward" size={12} color={accent} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[s.meta, { color: col.t3 }]}>{fmt(msg.time)}</Text>
      </View>
    </Animated.View>
  );
};

// ── CHAT SCREEN ───────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  { label: "Who's home?",       icon: 'home-outline'       },
  { label: "Any deliveries?",   icon: 'cube-outline'       },
  { label: "Is it safe?",       icon: 'shield-outline'     },
  { label: "What happened today?", icon: 'time-outline'    },
  { label: "Any strangers?",    icon: 'eye-outline'        },
  { label: "Lock the doors",    icon: 'lock-closed-outline'},
];

export const ChatScreen: React.FC = () => {
  const { chat, addChatMessage, orbState, isDark } = useStore();
  const col = getColors(isDark);
  const insets  = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping,  setIsTyping]  = useState(false);
  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const stateColor = getStateColor(orbState, isDark);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  useEffect(() => { scrollToBottom(); }, [chat]);

  const sendMessage = useCallback((text?: string) => {
    const msg = (text ?? inputText).trim();
    if (!msg) return;
    setInputText('');
    addChatMessage({ id: uid(), from: 'user', text: msg, time: new Date() });
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addChatMessage({
        id: uid(), from: 'sentinel',
        text: getSentinelResponse(msg),
        time: new Date(), color: 'cyan',
      });
    }, 900 + Math.random() * 700);
  }, [inputText]);

  const renderItem: ListRenderItem<ChatMessage> = useCallback(
    ({ item }) => <MessageItem msg={item} />,
    []
  );

  return (
    <KeyboardAvoidingView
      style={[s.root, { paddingTop: insets.top, backgroundColor: col.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* ── HEADER ── */}
      <View style={[s.header, { borderBottomColor: `${stateColor}30` }]}>
        <View style={s.headerLeft}>
          <View style={[s.headerOrbWrap, { borderColor: `${stateColor}60`, shadowColor: stateColor }]}>
            <LinearGradient
              colors={ORB_GRADIENT[orbState] as [string, string, string, string]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.3, y: 0.1 }}
              end={{ x: 0.8, y: 1 }}
            />
          </View>
          <View>
            <Text style={[s.headerName, { color: col.text }]}>Sentinel</Text>
            <View style={s.headerStatusRow}>
              <View style={[s.statusDot, { backgroundColor: stateColor }]} />
              <Text style={[s.headerStatus, { color: stateColor }]}>
                {orbState === 'threat' ? 'Threat detected — monitoring' :
                 orbState === 'unknown' ? 'Unknown person — analysing' :
                 orbState === 'family'  ? 'Family home — all clear' :
                 orbState === 'privacy' ? 'Privacy mode active' :
                 'Monitoring · All clear'}
              </Text>
            </View>
          </View>
        </View>
        <Ionicons name="ellipsis-horizontal" size={20} color={col.t2} />
      </View>

      {/* ── MESSAGES ── */}
      <FlatList
        ref={listRef}
        data={chat}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[s.messages, { paddingBottom: 16 }]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />

      {/* ── SUGGESTIONS ── */}
      {inputText.length === 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.suggestions}
          style={s.suggestionsWrap}
        >
          {SUGGESTIONS.map(sg => (
            <TouchableOpacity
              key={sg.label}
              style={[s.pill, { borderColor: `${stateColor}30`, backgroundColor: `${stateColor}0a` }]}
              onPress={() => sendMessage(sg.label)}
              activeOpacity={0.7}
            >
              <Ionicons name={sg.icon as any} size={12} color={stateColor} />
              <Text style={[s.pillText, { color: stateColor }]}>{sg.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ── INPUT ── */}
      <View style={[s.inputBar, { paddingBottom: insets.bottom + 8, borderTopColor: `${stateColor}20`, backgroundColor: col.s1 }]}>
        <TextInput
          style={[s.input, { backgroundColor: col.s2, color: col.text, borderColor: col.border }]}
          placeholder="Ask Sentinel anything…"
          placeholderTextColor={col.t3}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => sendMessage()}
          returnKeyType="send"
          multiline={false}
        />
        <TouchableOpacity
          style={[s.sendBtn, { backgroundColor: col.s3, borderColor: col.border }, inputText.trim().length > 0 && { backgroundColor: stateColor, borderColor: stateColor }]}
          onPress={() => sendMessage()}
          activeOpacity={0.8}
          disabled={inputText.trim().length === 0}
        >
          <Ionicons name="arrow-up" size={17} color={inputText.trim().length > 0 ? col.bg : col.t3} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ── STYLES ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1,
  },
  headerLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerOrbWrap:   {
    width: 42, height: 42, borderRadius: 21, overflow: 'hidden',
    borderWidth: 1.5, shadowRadius: 10, shadowOpacity: 0.6, shadowOffset: { width: 0, height: 0 },
    alignItems: 'center', justifyContent: 'center',
  },
  headerName:      { color: C.text, fontSize: 16, fontWeight: '800' },
  headerStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot:       { width: 5, height: 5, borderRadius: 2.5 },
  headerStatus:    { fontSize: 11, fontWeight: '600' },

  messages: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },

  row:     { flexDirection: 'row', alignItems: 'flex-end', gap: 9 },
  rowUser: { justifyContent: 'flex-end' },

  avatarRing: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1.5,
    flexShrink: 0, alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: 30, height: 30, borderRadius: 15, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },

  bubbleCol: { flex: 1, maxWidth: '80%', gap: 4 },

  bubbleSentinel: {
    backgroundColor: C.s2,
    borderWidth: 1,
    borderColor: C.border,
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 8,
  },

  bubbleUser: {
    borderBottomRightRadius: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 11,
    maxWidth: '80%',
  },

  alertBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  alertBadgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  textSentinel: { color: C.t2, fontSize: 14, lineHeight: 21 },
  textUser:     { color: C.bg, fontSize: 14, lineHeight: 21, fontWeight: '500' },

  clipBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 11, paddingVertical: 7,
  },
  clipBtnText: { fontSize: 12, fontWeight: '700' },

  meta:     { color: C.t3, fontSize: 10, paddingLeft: 2 },
  metaUser: { color: 'rgba(0,0,0,0.4)', fontSize: 10, marginTop: 4, textAlign: 'right' },

  suggestionsWrap: { flexShrink: 0 },
  suggestions: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 20, paddingHorizontal: 13, paddingVertical: 7,
    borderWidth: 1,
  },
  pillText: { fontSize: 12, fontWeight: '600' },

  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingTop: 10,
    borderTopWidth: 1, backgroundColor: C.s1,
  },
  input: {
    flex: 1,
    backgroundColor: C.s2,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    color: C.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.s3, borderWidth: 1, borderColor: C.border,
  },
});
