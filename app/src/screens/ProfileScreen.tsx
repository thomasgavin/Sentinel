import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { C } from '../theme';

const relTime = (d: Date) => {
  const m = Math.floor((Date.now() - d.getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
};

export const ProfileScreen: React.FC = () => {
  const {
    household, armed, privacyMode,
    toggleArmed, togglePrivacy, subscription,
  } = useStore();
  const insets = useSafeAreaInsets();

  const homeCount = household.filter(m => m.status === 'home').length;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Household & Settings</Text>
        <View style={styles.planBadge}>
          <Text style={styles.planText}>{subscription.toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      >
        {/* ── HOUSEHOLD ── */}
        <Text style={styles.sectionLabel}>Household</Text>
        <View style={styles.card}>
          {household.map((member, index) => (
            <React.Fragment key={member.id}>
              <View style={styles.memberRow}>
                <View style={[styles.avatar, { backgroundColor: `${member.color}22`, borderColor: member.color + (member.status === 'home' ? 'aa' : '33') }]}>
                  <Text style={[styles.avatarText, { color: member.color }]}>{member.initials}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <View style={styles.memberTop}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <View style={[
                      styles.statusBadge,
                      member.status === 'home' ? styles.statusHome : styles.statusAway,
                    ]}>
                      <View style={[styles.statusDot, { backgroundColor: member.status === 'home' ? C.green : C.t3 }]} />
                      <Text style={[styles.statusText, { color: member.status === 'home' ? C.green : C.t3 }]}>
                        {member.status === 'home' ? 'Home' : 'Away'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.memberRole}>{member.role}</Text>
                  <Text style={styles.memberSeen}>
                    {member.status === 'home'
                      ? `Arrived ${relTime(member.lastSeen)}`
                      : `Last seen ${relTime(member.lastSeen)}`}
                  </Text>
                </View>
                <View style={styles.memberStats}>
                  <Text style={styles.statNum}>{member.arrivals}</Text>
                  <Text style={styles.statLabel}>arrivals</Text>
                </View>
              </View>
              {index < household.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── HOME STATUS ── */}
        <Text style={styles.sectionLabel}>Home Status</Text>
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <Ionicons name="shield-checkmark" size={18} color={armed ? C.green : C.t2} />
              <View>
                <Text style={styles.settingTitle}>System Armed</Text>
                <Text style={styles.settingDesc}>
                  {armed ? 'All entry points monitored' : 'Motion detection paused'}
                </Text>
              </View>
            </View>
            <Switch
              value={armed}
              onValueChange={toggleArmed}
              trackColor={{ false: C.s4, true: `${C.green}88` }}
              thumbColor={armed ? C.green : C.t2}
              ios_backgroundColor={C.s4}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <Ionicons name={privacyMode ? 'eye-off' : 'eye'} size={18} color={privacyMode ? C.orange : C.t2} />
              <View>
                <Text style={styles.settingTitle}>Privacy Mode</Text>
                <Text style={styles.settingDesc}>
                  {privacyMode ? 'All cameras paused' : 'Cameras monitoring'}
                </Text>
              </View>
            </View>
            <Switch
              value={privacyMode}
              onValueChange={togglePrivacy}
              trackColor={{ false: C.s4, true: `${C.orange}88` }}
              thumbColor={privacyMode ? C.orange : C.t2}
              ios_backgroundColor={C.s4}
            />
          </View>
        </View>

        {/* ── SUBSCRIPTION ── */}
        <Text style={styles.sectionLabel}>Subscription</Text>
        <View style={[styles.card, styles.subCard]}>
          <View style={styles.subHeader}>
            <View>
              <Text style={styles.subPlan}>Sentinel {subscription.charAt(0).toUpperCase() + subscription.slice(1)}</Text>
              <Text style={styles.subPrice}>
                {subscription === 'free' ? 'Free' : subscription === 'home' ? '$19.99 / month' : '$39.99 / month'}
              </Text>
            </View>
            <View style={styles.subBadge}>
              <Text style={styles.subBadgeText}>Active</Text>
            </View>
          </View>
          <View style={styles.subFeatures}>
            {(subscription === 'home' || subscription === 'pro') && [
              { icon: 'people', label: 'Identity tracking · 6 members' },
              { icon: 'chatbubble-ellipses', label: 'Full AI agent + voice' },
              { icon: 'notifications-off', label: 'Zero-noise smart alerts' },
              { icon: 'cloud', label: '30-day cloud clip retention' },
            ].map(f => (
              <View key={f.label} style={styles.subFeature}>
                <Ionicons name={f.icon as any} size={13} color={C.green} />
                <Text style={styles.subFeatureText}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── NOTIFICATIONS ── */}
        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.card}>
          {[
            { label: 'Family arrivals & departures', value: true, icon: 'person' },
            { label: 'Unknown visitors',             value: true, icon: 'help-circle' },
            { label: 'Package deliveries',           value: true, icon: 'cube' },
            { label: 'Motion alerts',                value: false, icon: 'body' },
            { label: 'Threats & emergencies',        value: true, icon: 'warning' },
          ].map((item, i, arr) => (
            <React.Fragment key={item.label}>
              <View style={styles.statusRow}>
                <View style={styles.statusLeft}>
                  <Ionicons name={item.icon as any} size={16} color={C.t2} />
                  <Text style={styles.settingTitle}>{item.label}</Text>
                </View>
                <Switch
                  value={item.value}
                  trackColor={{ false: C.s4, true: `${C.accent}88` }}
                  thumbColor={item.value ? C.accent : C.t2}
                  ios_backgroundColor={C.s4}
                />
              </View>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── ABOUT ── */}
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          {[
            { label: 'Version', value: '1.0.0 (Beta)' },
            { label: 'Cameras', value: '4 registered' },
            { label: 'Household', value: `${household.length} members · ${homeCount} home` },
            { label: 'Privacy', value: 'Raw video never leaves device' },
          ].map((row, i, arr) => (
            <React.Fragment key={row.label}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.footer}>Sentinel · Your home knows who belongs.</Text>
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
  heading: { color: C.text, fontSize: 20, fontWeight: '700' },
  planBadge: {
    backgroundColor: C.accentDim,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: `${C.accent}44`,
  },
  planText: { color: C.accent, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  content: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  sectionLabel: {
    color: C.t2, fontSize: 11, fontWeight: '700',
    letterSpacing: 0.1, textTransform: 'uppercase',
    marginTop: 8, marginBottom: 2,
  },
  card: {
    backgroundColor: C.s1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: C.border },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, flexShrink: 0,
  },
  avatarText:  { fontSize: 16, fontWeight: '700' },
  memberInfo:  { flex: 1 },
  memberTop:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  memberName:  { color: C.text, fontSize: 14, fontWeight: '600' },
  memberRole:  { color: C.t2,   fontSize: 11 },
  memberSeen:  { color: C.t3,   fontSize: 11, marginTop: 1 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2,
  },
  statusHome: { backgroundColor: C.greenDim },
  statusAway: { backgroundColor: 'rgba(255,255,255,0.04)' },
  statusDot:  { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 11, fontWeight: '600' },
  memberStats: { alignItems: 'center', flexShrink: 0 },
  statNum:     { color: C.text, fontSize: 15, fontWeight: '700' },
  statLabel:   { color: C.t3,   fontSize: 10 },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  settingTitle: { color: C.text, fontSize: 13, fontWeight: '500' },
  settingDesc:  { color: C.t3,   fontSize: 11, marginTop: 1 },

  subCard: {},
  subHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 14,
  },
  subPlan:  { color: C.text, fontSize: 15, fontWeight: '700' },
  subPrice: { color: C.t2,   fontSize: 12, marginTop: 2 },
  subBadge: {
    backgroundColor: C.greenDim, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: `${C.green}44`,
  },
  subBadgeText: { color: C.green, fontSize: 10, fontWeight: '700' },
  subFeatures:  { paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
  subFeature:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subFeatureText: { color: C.t2, fontSize: 12 },

  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 14,
  },
  infoLabel: { color: C.t2,   fontSize: 13 },
  infoValue: { color: C.text, fontSize: 13, fontWeight: '500' },

  footer: { color: C.t3, fontSize: 11, textAlign: 'center', marginTop: 16 },
});
