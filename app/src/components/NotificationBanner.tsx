import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SentinelEvent } from '../types';
import { C, EVENT_COLOR, EVENT_ICON } from '../theme';
import { useStore } from '../store';

export const NotificationBanner: React.FC = () => {
  const { banner, hideBanner } = useStore();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (banner.visible && banner.event) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const t = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: -120, duration: 280, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start(() => hideBanner());
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [banner.visible]);

  if (!banner.event) return null;

  const e     = banner.event;
  const color = EVENT_COLOR[e.type] ?? C.t2;
  const icon  = EVENT_ICON[e.type]  ?? 'ellipse';

  return (
    <Animated.View
      style={[
        styles.banner,
        { top: insets.top + (Platform.OS === 'android' ? 8 : 6) },
        { transform: [{ translateY }], opacity },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon as any} size={16} color={color} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={1}>{e.title}</Text>
        <Text style={styles.body}  numberOfLines={1}>{e.body}</Text>
      </View>
      <View style={[styles.pill, { backgroundColor: `${color}22` }]}>
        <Text style={[styles.pillText, { color }]}>Now</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 16, right: 16,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.s3,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: C.border2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    shadowOpacity: 0.6,
    elevation: 20,
  },
  iconWrap: {
    width: 32, height: 32, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: { flex: 1 },
  title: { color: C.text, fontSize: 13, fontWeight: '600' },
  body:  { color: C.t2,   fontSize: 11, marginTop: 1 },
  pill: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    flexShrink: 0,
  },
  pillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
});
