import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

interface Props {
  source: ReturnType<typeof require>;
  camName: string;
  location: string;
  height?: number;
}

export const CamVideoPlayer: React.FC<Props> = ({ source, camName, location, height = 210 }) => {
  const [time, setTime] = useState('');
  const dotOp = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      const p = (x: number) => String(x).padStart(2, '0');
      setTime(`${p(n.getMonth() + 1)}/${p(n.getDate())}/${n.getFullYear()}  ${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(dotOp, { toValue: 0.1, duration: 550, useNativeDriver: true }),
      Animated.timing(dotOp, { toValue: 1,   duration: 550, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, []);

  return (
    <View style={[styles.root, { height }]}>
      <Video
        source={source}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
        useNativeControls={false}
      />

      {/* scanlines */}
      <View style={styles.scan} pointerEvents="none" />

      {/* vignette */}
      <View style={styles.vign} pointerEvents="none" />

      {/* top row */}
      <View style={styles.top} pointerEvents="none">
        <View style={styles.liveBadge}>
          <Animated.View style={[styles.liveDot, { opacity: dotOp }]} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.timestamp}>{time}</Text>
      </View>

      {/* bottom row */}
      <View style={styles.bottom} pointerEvents="none">
        <Text style={styles.camName}>{camName.toUpperCase()}</Text>
        <Text style={styles.location}>{location}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 20,
  },
  scan: {
    ...StyleSheet.absoluteFillObject,
    // repeating horizontal lines — CSS not available, simulate with low opacity overlay
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  vign: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderWidth: 28,
    borderColor: 'rgba(0,0,0,0.45)',
  },
  top: {
    position: 'absolute',
    top: 10, left: 10, right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveDot: {
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: '#ff3357',
  },
  liveText: {
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  timestamp: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'monospace',
    fontSize: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
  },
  bottom: {
    position: 'absolute',
    bottom: 10, left: 10, right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  camName: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  location: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
    fontSize: 10,
  },
});
