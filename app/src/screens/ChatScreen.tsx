import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Animated, ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { ChatMessage } from '../types';
import { getSentinelResponse } from '../engine';
import { C, ORB_GRADIENT } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

const fmt = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

const BUBBLE_COLOR: Record<string, string> = {
  cyan:   C.accent,
  green:  C.green,
  orange: C.orange,
  red:    C.red,
};

const TypingIndicator: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = (v: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1,   duration: 300, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        Animated.delay(600),
      ]));
    const a1 = anim(dot1, 0);
    const a2 = anim(dot2, 200);
    const a3 = anim(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={styles.msgRow}>
      <View style={styles.sentinelAvatar}>
        <LinearGradient
          colors={['#1cf5ff', '#0090aa', '#001a22', '#050e12']}
          style={styles.avatarGrad}
        />
      </View>
      <View style={[styles.bubble, styles.bubbleSentinel, { paddingVertical: 12 }]}>
        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
          {[dot1, dot2, dot3].map((v, i) => (
            <Animated.View
              key={i}
              style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.t2, opacity: v }}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const MessageItem: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const isUser = msg.from === 'user';
  const accentColor = msg.color ? BUBBLE_COLOR[msg.color] : C.t2;

  if (isUser) {
    return (
      <View style={[styles.msgRow, styles.msgRowUser]}>
        <View style={[styles.bubble, styles.bubbleUser]}>
          <Text style={styles.bubbleTextUser}>{msg.text}</Text>
          <Text style={styles.metaUser}>{fmt(msg.time)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.msgRow}>
      <View style={styles.sentinelAvatar}>
        <LinearGradient
          colors={ORB_GRADIENT.idle as [string, string, string, string]}
          style={styles.avatarGrad}
        />
      </View>
      <View style={styles.bubbleCol}>
        <View style={[styles.bubble, styles.bubbleSentinel, { borderColor: `${accentColor}33` }]}>
          <Text style={styles.bubbleTextSentinel}>{msg.text}</Text>
        </View>
        <Text style={styles.meta}>{fmt(msg.time)}</Text>
      </View>
    </View>
  );
};

export const ChatScreen: React.FC = () => {
  const { chat, addChatMessage, orbState } = useStore();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(() => { scrollToBottom(); }, [chat]);

  const sendMessage = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');

    addChatMessage({ id: uid(), from: 'user', text, time: new Date() });
    setIsTyping(true);

    const thinkTime = 800 + Math.random() * 900;
    setTimeout(() => {
      const response = getSentinelResponse(text);
      setIsTyping(false);
      addChatMessage({
        id: uid(), from: 'sentinel', text: response,
        time: new Date(), color: 'cyan',
      });
    }, thinkTime);
  }, [inputText]);

  const renderItem: ListRenderItem<ChatMessage> = useCallback(
    ({ item }) => <MessageItem msg={item} />,
    []
  );

  const SUGGESTIONS = ["Who's home?", "Any deliveries?", "What happened today?", "Lock the doors"];

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerOrb}>
            <LinearGradient
              colors={ORB_GRADIENT[orbState] as [string, string, string, string]}
              style={styles.headerOrbGrad}
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>Sentinel</Text>
            <View style={styles.headerStatusRow}>
              <View style={styles.liveDot} />
              <Text style={styles.headerStatus}>Online · monitoring your home</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Ionicons name="mic-outline" size={20} color={C.t2} />
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={chat}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.messages, { paddingBottom: 12 }]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />

      {/* Suggestion pills (only when input is empty) */}
      {inputText.length === 0 && (
        <View style={styles.suggestions}>
          {SUGGESTIONS.map(s => (
            <TouchableOpacity
              key={s}
              style={styles.suggestionPill}
              onPress={() => setInputText(s)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.input}
          placeholder="Ask Sentinel anything…"
          placeholderTextColor={C.t3}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          multiline={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, inputText.trim().length > 0 && styles.sendBtnActive]}
          onPress={sendMessage}
          activeOpacity={0.8}
          disabled={inputText.trim().length === 0}
        >
          <Ionicons
            name="arrow-up"
            size={16}
            color={inputText.trim().length > 0 ? C.bg : C.t3}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerOrb: {
    width: 38, height: 38, borderRadius: 19, overflow: 'hidden',
    borderWidth: 1, borderColor: `${C.accent}55`,
  },
  headerOrbGrad: { width: '100%', height: '100%' },
  headerTitle:  { color: C.text, fontSize: 15, fontWeight: '700' },
  headerStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.green },
  headerStatus: { color: C.t2, fontSize: 11 },
  headerRight: { padding: 4 },

  messages: { paddingHorizontal: 14, paddingTop: 12, gap: 12 },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser: { justifyContent: 'flex-end' },

  sentinelAvatar: {
    width: 26, height: 26, borderRadius: 13, overflow: 'hidden',
    flexShrink: 0, borderWidth: 1, borderColor: `${C.accent}44`,
  },
  avatarGrad: { width: '100%', height: '100%' },

  bubbleCol: { flex: 1, maxWidth: '78%', gap: 3 },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderWidth: 1,
  },
  bubbleSentinel: {
    backgroundColor: C.s2,
    borderColor: C.border,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  bubbleUser: {
    backgroundColor: C.s3,
    borderColor: C.border2,
    borderBottomRightRadius: 4,
    maxWidth: '78%',
  },
  bubbleTextSentinel: { color: C.text, fontSize: 14, lineHeight: 20 },
  bubbleTextUser:     { color: C.text, fontSize: 14, lineHeight: 20 },
  meta:     { color: C.t3, fontSize: 10, paddingLeft: 4 },
  metaUser: { color: C.t3, fontSize: 10, textAlign: 'right', marginTop: 4 },

  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  suggestionPill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: C.s2,
    borderWidth: 1,
    borderColor: C.border,
  },
  suggestionText: { color: C.t2, fontSize: 12 },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.s1,
  },
  input: {
    flex: 1,
    backgroundColor: C.s3,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: C.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.s3, borderWidth: 1, borderColor: C.border,
  },
  sendBtnActive: { backgroundColor: C.accent, borderColor: C.accent },
});
