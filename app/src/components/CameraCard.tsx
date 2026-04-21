import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Camera } from '../types';
import { C } from '../theme';

interface CameraCardProps {
  camera: Camera;
  compact?: boolean;
}

export const CameraCard: React.FC<CameraCardProps> = ({ camera, compact = false }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const noiseOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (camera.motionActive) {
      const anim = Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 500, useNativeDriver: true }),
      ]));
      anim.start();
      return () => anim.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [camera.motionActive]);

  // Subtle noise animation on the "lens"
  useEffect(() => {
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(noiseOffset, { toValue: 1, duration: 3000 + Math.random() * 2000, useNativeDriver: true }),
      Animated.timing(noiseOffset, { toValue: 0, duration: 3000 + Math.random() * 2000, useNativeDriver: true }),
    ]));
    anim.start();
    return () => anim.stop();
  }, []);

  const isPrivacy = camera.status === 'privacy';
  const isOffline = camera.status === 'offline';
  const h = compact ? 100 : 160;

  // Simulated "scene" gradient — different per camera
  const sceneColors: Record<string, [string, string, string]> = {
    'cam-front':    ['#0d1a12', '#0a1520', '#060d18'],
    'cam-back':     ['#0c1808', '#0f1a06', '#080f05'],
    'cam-garage':   ['#110d08', '#180f06', '#0e0a05'],
    'cam-driveway': ['#0a0d14', '#0c1018', '#07090f'],
  };
  const scene = sceneColors[camera.id] ?? ['#0d0d0d', '#111111', '#0a0a0a'];

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      {/* Camera "view" */}
      <View style={{ height: h, overflow: 'hidden', borderRadius: 12 }}>
        <LinearGradient colors={scene} style={StyleSheet.absoluteFill} />

        {/* Grid overlay — simulates camera grid lines */}
        <View style={[StyleSheet.absoluteFill, styles.grid]} pointerEvents="none">
          {[0.33, 0.66].map(p => (
            <View key={p} style={[styles.gridV, { left: `${p * 100}%` as any }]} />
          ))}
          {[0.33, 0.66].map(p => (
            <View key={p} style={[styles.gridH, { top: `${p * 100}%` as any }]} />
          ))}
        </View>

        {/* Detection box (when motion active) */}
        {camera.motionActive && !isPrivacy && (
          <Animated.View style={[styles.detectionBox, { opacity: pulseAnim }]} />
        )}

        {/* Timestamp overlay */}
        {!isPrivacy && !isOffline && (
          <View style={styles.timestamp}>
            <Text style={styles.tsText}>
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </Text>
          </View>
        )}

        {/* Privacy overlay */}
        {isPrivacy && (
          <View style={styles.privacyOverlay}>
            <Ionicons name="eye-off" size={22} color={C.t3} />
            <Text style={styles.privacyText}>Privacy mode</Text>
          </View>
        )}

        {/* Offline overlay */}
        {isOffline && (
          <View style={styles.privacyOverlay}>
            <Ionicons name="wifi-outline" size={22} color={C.t3} />
            <Text style={styles.privacyText}>Offline</Text>
          </View>
        )}

        {/* Status badge */}
        <View style={styles.statusBadge}>
          <Animated.View style={[styles.liveDot, { opacity: isPrivacy || isOffline ? 0.3 : pulseAnim }]} />
          <Text style={styles.liveText}>{isPrivacy ? 'PAUSED' : isOffline ? 'OFFLINE' : camera.motionActive ? 'MOTION' : 'LIVE'}</Text>
        </View>
      </View>

      {/* Card footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.camName}>{camera.name}</Text>
          {!compact && <Text style={styles.camLoc}>{camera.location}</Text>}
        </View>
        <View style={styles.stats}>
          {!compact && (
            <Text style={styles.statText}>
              <Text style={{ color: C.t2 }}>↑</Text> {camera.detectionCount}
            </Text>
          )}
          {camera.motionActive && (
            <View style={[styles.chip, { backgroundColor: C.orangeDim }]}>
              <Text style={[styles.chipText, { color: C.orange }]}>Motion</Text>
            </View>
          )}
        </View>
      </View>
      {!compact && (
        <Text style={styles.lastEvent} numberOfLines={1}>{camera.lastEvent}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.s2,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
  },
  cardCompact: {},
  grid: { opacity: 0.12 },
  gridV: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  gridH: {
    position: 'absolute',
    left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  detectionBox: {
    position: 'absolute',
    top: '25%', left: '30%',
    width: '40%', height: '45%',
    borderWidth: 1.5,
    borderColor: '#FF8A3D',
    borderRadius: 4,
  },
  timestamp: {
    position: 'absolute',
    bottom: 8, left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  tsText: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontVariant: ['tabular-nums'] },
  privacyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(8,8,8,0.6)',
  },
  privacyText: { color: C.t3, fontSize: 12 },
  statusBadge: {
    position: 'absolute',
    top: 8, right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  liveDot: {
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: '#00FF87',
  },
  liveText: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  camName: { color: C.text, fontSize: 13, fontWeight: '600' },
  camLoc:  { color: C.t3,   fontSize: 11, marginTop: 1 },
  stats:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statText:{ color: C.t3, fontSize: 11 },
  chip: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  chipText: { fontSize: 10, fontWeight: '600' },
  lastEvent: {
    color: C.t3,
    fontSize: 11,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
});
