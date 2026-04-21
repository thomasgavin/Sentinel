import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OrbState } from '../types';
import { ORB_GRADIENT, ORB_GLOW } from '../theme';

interface OrbProps {
  state: OrbState;
  size?: number;
}

export const Orb: React.FC<OrbProps> = ({ state, size = 120 }) => {
  const breathe   = useRef(new Animated.Value(1)).current;
  const halo1Op   = useRef(new Animated.Value(0.55)).current;
  const halo2Op   = useRef(new Animated.Value(0.28)).current;
  const threatPulse = useRef(new Animated.Value(1)).current;
  const eyeScaleY = useRef(new Animated.Value(1)).current;

  // Breathing loop
  useEffect(() => {
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(breathe, { toValue: 1.045, duration: 2600, useNativeDriver: true }),
      Animated.timing(breathe, { toValue: 1.0,   duration: 2600, useNativeDriver: true }),
    ]));
    const halo = Animated.loop(Animated.sequence([
      Animated.timing(halo1Op, { toValue: 0.15, duration: 2200, useNativeDriver: true }),
      Animated.timing(halo1Op, { toValue: 0.55, duration: 2200, useNativeDriver: true }),
    ]));
    anim.start(); halo.start();
    return () => { anim.stop(); halo.stop(); };
  }, []);

  // Eye blink scheduler
  useEffect(() => {
    let cancelled = false;
    const sched = () => {
      if (cancelled) return;
      const delay = 2800 + Math.random() * 5000;
      setTimeout(() => {
        if (cancelled) return;
        Animated.sequence([
          Animated.timing(eyeScaleY, { toValue: 0.05, duration: 75, useNativeDriver: true }),
          Animated.timing(eyeScaleY, { toValue: 1,    duration: 75, useNativeDriver: true }),
        ]).start(() => sched());
      }, delay);
    };
    sched();
    return () => { cancelled = true; };
  }, []);

  // Threat pulse
  useEffect(() => {
    if (state === 'threat') {
      const anim = Animated.loop(Animated.sequence([
        Animated.timing(threatPulse, { toValue: 1.1,  duration: 380, useNativeDriver: true }),
        Animated.timing(threatPulse, { toValue: 1.0,  duration: 380, useNativeDriver: true }),
      ]));
      anim.start();
      return () => anim.stop();
    } else {
      threatPulse.setValue(1);
    }
  }, [state]);

  const colors = ORB_GRADIENT[state] as [string, string, string, string];
  const glow   = ORB_GLOW[state];
  const outer  = size + 80;
  const inner  = size + 40;

  return (
    <View style={{ width: outer, height: outer, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer halo */}
      <Animated.View style={[
        StyleSheet.absoluteFill,
        { borderRadius: outer / 2, borderWidth: 1, borderColor: glow, opacity: halo1Op },
      ]} />
      {/* Inner halo */}
      <Animated.View style={{
        position: 'absolute',
        width: inner, height: inner,
        borderRadius: inner / 2,
        borderWidth: 1, borderColor: glow,
        opacity: halo2Op,
      }} />
      {/* Orb body */}
      <Animated.View style={{
        transform: [{ scale: Animated.multiply(breathe, threatPulse) }],
        shadowColor: glow,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 28,
        shadowOpacity: 1,
        elevation: 20,
      }}>
        <LinearGradient
          colors={colors}
          start={{ x: 0.36, y: 0.3 }}
          end={{ x: 0.8, y: 1 }}
          style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
        >
          {/* Eyes */}
          <View style={{ flexDirection: 'row', gap: Math.round(size * 0.12), marginTop: Math.round(size * 0.06) }}>
            {[0, 1].map(i => (
              <Animated.View
                key={i}
                style={{
                  width:  Math.round(size * 0.075),
                  height: Math.round(size * 0.075),
                  borderRadius: Math.round(size * 0.075 / 2),
                  backgroundColor: 'rgba(255,255,255,0.88)',
                  transform: [{ scaleY: eyeScaleY }],
                }}
              />
            ))}
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};
