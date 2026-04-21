import React, { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Animated, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { Orb } from '../components/Orb';
import { EventRow } from '../components/EventRow';
import { CameraCard } from '../components/CameraCard';
import { C, STATE_COLOR, STATE_LABEL, MEMBER_COLOR } from '../theme';

const relTime = (d: Date) => {
  const m = Math.floor((Date.now() - d.getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
};

export const HomeScreen: React.FC = () => {
  const { orbState, events, household, cameras, armed, toggleArmed, unreadCount } = useStore();
  const insets = useSafeAreaInsets();
  const armScale = useRef(new Animated.Value(1)).current;

  const recentEvents = events.slice(0, 4);
  const homeMembers  = household.filter(m => m.status === 'home');
  const awayMembers  = household.filter(m => m.status === 'away');
  const featuredCams = cameras.slice(0, 2);

  const stateColor = STATE_COLOR[orbState];
  const stateLabel = STATE_LABEL[orbState];

  const handleArmToggle = () => {
    Animated.sequence([
      Animated.timing(armScale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(armScale, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start();
    toggleArmed();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* ── NAV ── */}
      <View style={styles.nav}>
        <View style={styles.navLeft}>
          <View style={styles.navOrb} />
          <Text style={styles.navTitle}>SENTINEL</Text>
        </View>
        <Animated.View style={{ transform: [{ scale: armScale }] }}>
          <TouchableOpacity
            style={[styles.armBtn, armed ? styles.armBtnArmed : styles.armBtnDisarmed]}
            onPress={handleArmToggle}
            activeOpacity={0.8}
          >
            <Ionicons name={armed ? 'shield-checkmark' : 'shield-outline'} size={13} color={armed ? C.green : C.t2} />
            <Text style={[styles.armText, { color: armed ? C.green : C.t2 }]}>
              {armed ? 'Armed' : 'Disarmed'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── ORB SECTION ── */}
        <View style={styles.orbSection}>
          <Orb state={orbState} size={130} />
          <Text style={[styles.stateLabel, { color: stateColor }]}>{stateLabel}</Text>
          <Text style={styles.stateSub}>
            {homeMembers.length > 0
              ? `${homeMembers.map(m => m.name).join(' · ')} home`
              : 'Home is empty'}
          </Text>
        </View>

        {/* ── HOUSEHOLD STRIP ── */}
        <View style={styles.memberStrip}>
          {household.map(member => (
            <View key={member.id} style={styles.memberPill}>
              <View style={[
                styles.memberAvatar,
                { backgroundColor: `${member.color}22`, borderColor: member.color + (member.status === 'home' ? 'bb' : '33') },
              ]}>
                <Text style={[styles.memberInitial, { color: member.color }]}>{member.initials}</Text>
              </View>
              <Text style={[styles.memberName, { color: member.status === 'home' ? C.text : C.t3 }]}>
                {member.name}
              </Text>
              <View style={[styles.memberDot, { backgroundColor: member.status === 'home' ? C.green : C.t3 }]} />
            </View>
          ))}
        </View>

        {/* ── DAILY BRIEF CARD ── */}
        <View style={styles.briefCard}>
          <View style={styles.briefHeader}>
            <Ionicons name="sunny" size={14} color={C.amber} />
            <Text style={styles.briefTitle}>Daily Brief</Text>
            <Text style={styles.briefTime}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.briefStats}>
            <View style={styles.briefStat}>
              <Text style={styles.briefNum}>{events.filter(e => e.type === 'family_arrival' || e.type === 'family_departure').length}</Text>
              <Text style={styles.briefLabel}>Movements</Text>
            </View>
            <View style={styles.briefDivider} />
            <View style={styles.briefStat}>
              <Text style={styles.briefNum}>{events.filter(e => e.type === 'package_delivery').length}</Text>
              <Text style={styles.briefLabel}>Deliveries</Text>
            </View>
            <View style={styles.briefDivider} />
            <View style={styles.briefStat}>
              <Text style={[styles.briefNum, events.filter(e => e.type === 'unknown_person').length > 0 && { color: C.orange }]}>
                {events.filter(e => e.type === 'unknown_person').length}
              </Text>
              <Text style={styles.briefLabel}>Unknown</Text>
            </View>
            <View style={styles.briefDivider} />
            <View style={styles.briefStat}>
              <Text style={[styles.briefNum, { color: C.green }]}>{events.filter(e => e.type === 'threat').length === 0 ? '0' : events.filter(e => e.type === 'threat').length}</Text>
              <Text style={styles.briefLabel}>Threats</Text>
            </View>
          </View>
        </View>

        {/* ── RECENT EVENTS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Recent Activity</Text>
          <View style={styles.card}>
            {recentEvents.map(e => (
              <EventRow key={e.id} event={e} compact />
            ))}
          </View>
        </View>

        {/* ── CAMERA QUICK VIEW ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Cameras</Text>
          <View style={styles.camGrid}>
            {featuredCams.map(cam => (
              <View key={cam.id} style={{ flex: 1 }}>
                <CameraCard camera={cam} compact />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  navLeft:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navOrb: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: C.accent,
    shadowColor: C.accent, shadowRadius: 8, shadowOpacity: 0.6, shadowOffset: { width: 0, height: 0 },
  },
  navTitle: { color: C.text, fontSize: 13, fontWeight: '700', letterSpacing: 0.14 },
  armBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1,
  },
  armBtnArmed:    { borderColor: `${C.green}55`, backgroundColor: C.greenDim },
  armBtnDisarmed: { borderColor: C.border, backgroundColor: C.s2 },
  armText: { fontSize: 12, fontWeight: '600' },

  scroll:  { flex: 1 },
  content: { paddingHorizontal: 16, gap: 20, paddingTop: 8 },

  orbSection: { alignItems: 'center', paddingVertical: 12 },
  stateLabel: { fontSize: 17, fontWeight: '600', marginTop: 4 },
  stateSub:   { color: C.t2, fontSize: 13, marginTop: 4 },

  memberStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: C.s1,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  memberPill: { alignItems: 'center', gap: 5 },
  memberAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  memberInitial: { fontSize: 15, fontWeight: '700' },
  memberName:    { fontSize: 10, fontWeight: '500' },
  memberDot: {
    width: 5, height: 5, borderRadius: 2.5,
  },

  briefCard: {
    backgroundColor: C.s1,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  briefHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 12,
  },
  briefTitle: { color: C.text, fontSize: 13, fontWeight: '600', flex: 1 },
  briefTime:  { color: C.t3,   fontSize: 11 },
  briefStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  briefStat:  { alignItems: 'center', flex: 1 },
  briefNum:   { color: C.text, fontSize: 20, fontWeight: '700' },
  briefLabel: { color: C.t3, fontSize: 10, marginTop: 2 },
  briefDivider: { width: 1, height: 28, backgroundColor: C.border },

  section:      { gap: 10 },
  sectionLabel: { color: C.t2, fontSize: 11, fontWeight: '700', letterSpacing: 0.1, textTransform: 'uppercase' },
  card: {
    backgroundColor: C.s1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  camGrid: { flexDirection: 'row', gap: 10 },
});
