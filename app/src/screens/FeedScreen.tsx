import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { CameraCard } from '../components/CameraCard';
import { C } from '../theme';

export const FeedScreen: React.FC = () => {
  const { cameras, armed, privacyMode, togglePrivacy } = useStore();
  const insets = useSafeAreaInsets();
  const [layout, setLayout] = useState<'grid' | 'list'>('list');
  const [tick, setTick] = useState(0);

  // Force re-render every second so the timestamp in camera cards updates
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const activeCount  = cameras.filter(c => c.status === 'active').length;
  const motionCount  = cameras.filter(c => c.motionActive).length;
  const totalToday   = cameras.reduce((s, c) => s + c.detectionCount, 0);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Live Feed</Text>
          <Text style={styles.subheading}>
            {activeCount} of {cameras.length} cameras active
            {motionCount > 0 ? ` · ${motionCount} motion` : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.privacyBtn, privacyMode && styles.privacyBtnOn]}
          onPress={togglePrivacy}
        >
          <Ionicons name={privacyMode ? 'eye-off' : 'eye'} size={14} color={privacyMode ? C.t2 : C.accent} />
          <Text style={[styles.privacyText, { color: privacyMode ? C.t2 : C.accent }]}>
            {privacyMode ? 'Privacy On' : 'Privacy Off'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <View style={[styles.statDot, { backgroundColor: C.green }]} />
          <Text style={styles.statLabel}>{activeCount} Online</Text>
        </View>
        <View style={styles.stat}>
          <View style={[styles.statDot, { backgroundColor: motionCount > 0 ? C.orange : C.t3 }]} />
          <Text style={styles.statLabel}>{motionCount} Motion</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="scan" size={11} color={C.t2} />
          <Text style={styles.statLabel}>{totalToday} detections today</Text>
        </View>
        <View style={styles.statRight}>
          <TouchableOpacity onPress={() => setLayout(l => l === 'grid' ? 'list' : 'grid')}>
            <Ionicons name={layout === 'grid' ? 'list' : 'grid'} size={16} color={C.t2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {layout === 'list' ? (
          cameras.map(cam => (
            <CameraCard key={`${cam.id}-${tick}`} camera={cam} />
          ))
        ) : (
          <View style={styles.gridLayout}>
            {cameras.map(cam => (
              <View key={`${cam.id}-${tick}`} style={{ width: '48%' }}>
                <CameraCard camera={cam} compact />
              </View>
            ))}
          </View>
        )}

        {/* System info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={14} color={armed ? C.green : C.t3} />
            <Text style={styles.infoLabel}>System</Text>
            <Text style={[styles.infoValue, { color: armed ? C.green : C.t3 }]}>
              {armed ? 'Armed' : 'Disarmed'}
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Ionicons name="recording" size={14} color={C.accent} />
            <Text style={styles.infoLabel}>Recording</Text>
            <Text style={[styles.infoValue, { color: C.accent }]}>Cloud · 30-day retention</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Ionicons name="lock-closed" size={14} color={C.green} />
            <Text style={styles.infoLabel}>Privacy</Text>
            <Text style={[styles.infoValue, { color: privacyMode ? C.orange : C.t2 }]}>
              Raw video stays on-device
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  heading:    { color: C.text, fontSize: 20, fontWeight: '700' },
  subheading: { color: C.t2,   fontSize: 12, marginTop: 2 },
  privacyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.s2,
  },
  privacyBtnOn: { borderColor: C.border },
  privacyText: { fontSize: 12, fontWeight: '600' },

  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statDot: { width: 5, height: 5, borderRadius: 2.5 },
  statLabel: { color: C.t2, fontSize: 11 },
  statRight: { flex: 1, alignItems: 'flex-end' },

  scroll:  { flex: 1 },
  content: { padding: 16, gap: 12 },
  gridLayout: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },

  infoCard: {
    backgroundColor: C.s1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 4,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  infoLabel: { color: C.t2, fontSize: 13, flex: 1 },
  infoValue: { fontSize: 12, fontWeight: '500' },
  infoDivider: { height: 1, backgroundColor: C.border, marginHorizontal: 14 },
});
