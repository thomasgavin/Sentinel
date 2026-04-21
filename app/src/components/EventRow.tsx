import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SentinelEvent } from '../types';
import { C, EVENT_COLOR, EVENT_BG, EVENT_ICON } from '../theme';

interface EventRowProps {
  event: SentinelEvent;
  compact?: boolean;
}

const relTime = (d: Date): string => {
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (s < 10)  return 'just now';
  if (s < 60)  return `${s}s ago`;
  if (m < 60)  return `${m}m ago`;
  if (h < 24)  return `${h}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const EventRow: React.FC<EventRowProps> = ({ event, compact = false }) => {
  const color  = EVENT_COLOR[event.type] ?? C.t2;
  const bg     = EVENT_BG[event.type]    ?? 'rgba(255,255,255,0.04)';
  const icon   = EVENT_ICON[event.type]  ?? 'ellipse';

  return (
    <View style={[styles.row, compact && styles.compact]}>
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        <Ionicons name={icon as any} size={compact ? 15 : 17} color={color} />
      </View>
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={styles.time}>{relTime(event.time)}</Text>
        </View>
        {!compact && (
          <Text style={styles.sub} numberOfLines={1}>{event.body}</Text>
        )}
      </View>
      {event.severity === 'warning' && !event.resolved && (
        <View style={styles.dot} />
      )}
      {event.severity === 'alert' && !event.resolved && (
        <View style={[styles.dot, { backgroundColor: C.red }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 12,
  },
  compact: {
    paddingVertical: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    color: C.text,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  titleCompact: { fontSize: 13 },
  time: {
    color: C.t3,
    fontSize: 11,
    flexShrink: 0,
  },
  sub: {
    color: C.t2,
    fontSize: 12,
    marginTop: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: C.orange,
    flexShrink: 0,
  },
});
