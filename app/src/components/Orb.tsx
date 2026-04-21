import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OrbState } from '../types';
import { ORB_GRADIENT, ORB_GLOW } from '../theme';

interface OrbProps {
  state: OrbState;
  size?: number;
  lookUp?: boolean;
}

export const Orb: React.FC<OrbProps> = ({ state, size = 150, lookUp = false }) => {
  const breathe     = useRef(new Animated.Value(1)).current;
  const halo1Op     = useRef(new Animated.Value(0.5)).current;
  const halo2Op     = useRef(new Animated.Value(0.25)).current;
  const threatPulse = useRef(new Animated.Value(1)).current;

  // Eye animations
  const eyeStateH   = useRef(new Animated.Value(1)).current;
  const eyeBlinkH   = useRef(new Animated.Value(1)).current;
  const eyeScanX    = useRef(new Animated.Value(0)).current;
  const eyeLookY    = useRef(new Animated.Value(0)).current;
  const leftRotate  = useRef(new Animated.Value(0)).current;
  const rightRotate = useRef(new Animated.Value(0)).current;
  const eyeScaleY   = useRef(Animated.multiply(eyeStateH, eyeBlinkH)).current;

  const leftRotateStr  = leftRotate.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-40deg', '0deg', '40deg'] });
  const rightRotateStr = rightRotate.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-40deg', '0deg', '40deg'] });

  // Breathing
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(breathe,  { toValue: 1.04,  duration: 3200, useNativeDriver: true }),
      Animated.timing(breathe,  { toValue: 1.0,   duration: 3200, useNativeDriver: true }),
    ]));
    const h = Animated.loop(Animated.sequence([
      Animated.timing(halo1Op, { toValue: 0.10, duration: 2600, useNativeDriver: true }),
      Animated.timing(halo1Op, { toValue: 0.55, duration: 2600, useNativeDriver: true }),
    ]));
    a.start(); h.start();
    return () => { a.stop(); h.stop(); };
  }, []);

  // Blink scheduler
  useEffect(() => {
    let cancelled = false;
    const go = () => {
      if (cancelled) return;
      setTimeout(() => {
        if (cancelled) return;
        if (state !== 'threat' && state !== 'privacy') {
          const closeVal = state === 'family' ? 0.35 : 0.04;
          Animated.sequence([
            Animated.timing(eyeBlinkH, { toValue: closeVal, duration: 70,  useNativeDriver: true }),
            Animated.timing(eyeBlinkH, { toValue: 1,        duration: 95,  useNativeDriver: true }),
          ]).start(() => go());
        } else {
          go();
        }
      }, 3200 + Math.random() * 5000);
    };
    go();
    return () => { cancelled = true; };
  }, [state]);

  // Look-up animation
  useEffect(() => {
    if (lookUp) {
      Animated.sequence([
        Animated.spring(eyeLookY, { toValue: -(size * 0.10), useNativeDriver: true, tension: 100, friction: 8 }),
        Animated.delay(1800),
        Animated.spring(eyeLookY, { toValue: 0, useNativeDriver: true, tension: 60, friction: 8 }),
      ]).start();
    }
  }, [lookUp]);

  // State-driven eye expressions
  useEffect(() => {
    eyeScanX.stopAnimation();
    threatPulse.stopAnimation();
    eyeBlinkH.setValue(1);

    switch (state) {
      case 'idle': {
        // Big round eyes — open, alert
        Animated.spring(eyeStateH,   { toValue: 1.0, useNativeDriver: true, tension: 60 }).start();
        Animated.spring(leftRotate,  { toValue: 0,   useNativeDriver: true }).start();
        Animated.spring(rightRotate, { toValue: 0,   useNativeDriver: true }).start();
        eyeScanX.setValue(0);
        threatPulse.setValue(1);
        break;
      }
      case 'family': {
        // Happy dome squint — eyeCircle dims + flat-bottom arch
        Animated.spring(eyeStateH,   { toValue: 0.45, useNativeDriver: true, tension: 55, friction: 9 }).start();
        Animated.spring(leftRotate,  { toValue: 0,    useNativeDriver: true }).start();
        Animated.spring(rightRotate, { toValue: 0,    useNativeDriver: true }).start();
        eyeScanX.setValue(0);
        threatPulse.setValue(1);
        break;
      }
      case 'unknown': {
        // Horizontal oval scanning
        Animated.spring(eyeStateH,   { toValue: 1.0, useNativeDriver: true }).start();
        Animated.spring(leftRotate,  { toValue: 0,   useNativeDriver: true }).start();
        Animated.spring(rightRotate, { toValue: 0,   useNativeDriver: true }).start();
        const scan = Animated.loop(Animated.sequence([
          Animated.timing(eyeScanX, { toValue: 18,  duration: 520, useNativeDriver: true }),
          Animated.timing(eyeScanX, { toValue: -18, duration: 520, useNativeDriver: true }),
          Animated.timing(eyeScanX, { toValue: 0,   duration: 280, useNativeDriver: true }),
          Animated.delay(300),
        ]));
        scan.start();
        threatPulse.setValue(1);
        return () => { scan.stop(); eyeScanX.setValue(0); };
      }
      case 'threat': {
        // Angry: inner corners tilt DOWN toward nose (furrowed brow)
        Animated.spring(eyeStateH,   { toValue: 1.3,  useNativeDriver: true, tension: 140, friction: 6 }).start();
        Animated.spring(leftRotate,  { toValue: 0.65, useNativeDriver: true, tension: 100 }).start();
        Animated.spring(rightRotate, { toValue: -0.65, useNativeDriver: true, tension: 100 }).start();
        eyeScanX.setValue(0);
        const pulse = Animated.loop(Animated.sequence([
          Animated.timing(threatPulse, { toValue: 1.12, duration: 260, useNativeDriver: true }),
          Animated.timing(threatPulse, { toValue: 1.0,  duration: 260, useNativeDriver: true }),
        ]));
        pulse.start();
        return () => { pulse.stop(); threatPulse.setValue(1); };
      }
      case 'privacy': {
        // Closed — thin slits
        Animated.spring(eyeStateH,   { toValue: 0.07, useNativeDriver: true }).start();
        Animated.spring(leftRotate,  { toValue: 0,    useNativeDriver: true }).start();
        Animated.spring(rightRotate, { toValue: 0,    useNativeDriver: true }).start();
        eyeScanX.setValue(0);
        threatPulse.setValue(1);
        break;
      }
    }
  }, [state]);

  const colors = ORB_GRADIENT[state] as [string, string, string, string];
  const glow   = ORB_GLOW[state];
  const outer  = size + 60;
  const inner  = size + 28;

  // Eye dimensions change per state
  const isRound   = state === 'idle';
  const isFamily  = state === 'family';
  const eyeCircle = Math.round(size * 0.175);          // for idle round eyes
  const eyeOvalW  = Math.round(size * 0.27);           // for other oval eyes
  const eyeOvalH  = Math.round(size * 0.105);          // oval height
  const eyeGap    = isRound ? Math.round(size * 0.15) : Math.round(size * 0.13);

  const eyeDim = isRound || isFamily
    ? { width: eyeCircle, height: eyeCircle }
    : { width: eyeOvalW,  height: eyeOvalH  };

  const eyeShape = isFamily
    ? {
        borderTopLeftRadius:     eyeCircle,
        borderTopRightRadius:    eyeCircle,
        borderBottomLeftRadius:  4,
        borderBottomRightRadius: 4,
      }
    : { borderRadius: isRound ? eyeCircle / 2 : eyeOvalH / 2 };

  const eyeMarginTop = -Math.round(size * 0.08);

  return (
    <View style={{ width: outer, height: outer, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{
        position: 'absolute',
        width: outer, height: outer,
        borderRadius: outer / 2,
        borderWidth: 1,
        borderColor: glow,
        opacity: halo1Op,
      }} />
      <Animated.View style={{
        position: 'absolute',
        width: inner, height: inner,
        borderRadius: inner / 2,
        borderWidth: 1,
        borderColor: glow,
        opacity: halo2Op,
      }} />
      <Animated.View style={{
        transform: [{ scale: Animated.multiply(breathe, threatPulse) }],
        shadowColor:   glow,
        shadowOffset:  { width: 0, height: 0 },
        shadowRadius:  38,
        shadowOpacity: 1,
        elevation: 24,
      }}>
        <LinearGradient
          colors={colors}
          start={{ x: 0.28, y: 0.18 }}
          end={{ x: 0.82, y: 1 }}
          style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
        >
          <Animated.View style={{
            flexDirection: 'row',
            gap: eyeGap,
            marginTop: eyeMarginTop,
            transform: [{ translateY: eyeLookY }],
          }}>
            {/* Left eye */}
            <Animated.View style={[
              eyeDim,
              eyeShape,
              {
                backgroundColor: 'rgba(255,255,255,0.94)',
                transform: [
                  { scaleY: eyeScaleY },
                  { translateX: eyeScanX },
                  { rotate: leftRotateStr },
                ],
                shadowColor:   '#ffffff',
                shadowRadius:  10,
                shadowOpacity: 0.7,
                shadowOffset:  { width: 0, height: 0 },
              }
            ]} />
            {/* Right eye */}
            <Animated.View style={[
              eyeDim,
              eyeShape,
              {
                backgroundColor: 'rgba(255,255,255,0.94)',
                transform: [
                  { scaleY: eyeScaleY },
                  { translateX: eyeScanX },
                  { rotate: rightRotateStr },
                ],
                shadowColor:   '#ffffff',
                shadowRadius:  10,
                shadowOpacity: 0.7,
                shadowOffset:  { width: 0, height: 0 },
              }
            ]} />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};
