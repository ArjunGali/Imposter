import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

// Fade + slide-up on mount. Wrap screen content or individual cards.
export function FadeIn({ children, delay = 0, from = 24, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(v, {
      toValue: 1,
      delay,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [v, delay]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [
            {
              translateY: v.interpolate({
                inputRange: [0, 1],
                outputRange: [from, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Pop-in with overshoot, for badges and reveals.
export function PopIn({ children, delay = 0, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(v, {
      toValue: 1,
      delay,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [v, delay]);
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ scale: v }] }]}>
      {children}
    </Animated.View>
  );
}

// Gentle infinite pulse, for "hold to reveal" prompts and low timers.
export function Pulse({ children, style, active = true }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [v, active]);
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  return (
    <Animated.View style={[style, active && { transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
}

// Horizontal bar that grows to `pct` (0..1). For vote tallies.
export function GrowBar({ pct, color, delay = 0, height = 12, radius = 6 }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 600,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [v, delay]);
  return (
    <Animated.View
      style={{
        height,
        borderRadius: radius,
        backgroundColor: color,
        width: v.interpolate({
          inputRange: [0, 1],
          outputRange: ['0%', `${Math.max(pct * 100, 4)}%`],
        }),
      }}
    />
  );
}
