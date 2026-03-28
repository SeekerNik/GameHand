// TimerDisplay — Animated large clock with neon glow
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface TimerDisplayProps {
  hours: string;
  minutes: string;
  seconds: string;
  isRunning: boolean;
}

export default function TimerDisplay({ hours, minutes, seconds, isRunning }: TimerDisplayProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 0.8, duration: 1500, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      glowAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      Animated.timing(glowAnim, { toValue: 0.15, duration: 300, useNativeDriver: true }).start();
    }
  }, [isRunning]);

  return (
    <View style={styles.container}>
      {/* Glow background */}
      <Animated.View style={[styles.glowBg, { opacity: glowAnim }]}>
        <LinearGradient
          colors={['rgba(0,240,255,0.2)', 'rgba(168,85,247,0.15)', 'transparent']}
          style={styles.glowGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
        <LinearGradient
          colors={[Colors.surface, Colors.backgroundTertiary]}
          style={styles.timerBg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.timeRow}>
            <View style={styles.digitGroup}>
              <Text style={[styles.digit, isRunning && styles.digitActive]}>{hours}</Text>
              <Text style={styles.label}>HRS</Text>
            </View>

            <Text style={[styles.separator, isRunning && styles.separatorActive]}>:</Text>

            <View style={styles.digitGroup}>
              <Text style={[styles.digit, isRunning && styles.digitActive]}>{minutes}</Text>
              <Text style={styles.label}>MIN</Text>
            </View>

            <Text style={[styles.separator, isRunning && styles.separatorActive]}>:</Text>

            <View style={styles.digitGroup}>
              <Text style={[styles.digit, isRunning && styles.digitActive]}>{seconds}</Text>
              <Text style={styles.label}>SEC</Text>
            </View>
          </View>

          {isRunning && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>SESSION LIVE</Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xl,
    position: 'relative',
  },
  glowBg: {
    position: 'absolute',
    width: 320,
    height: 220,
    borderRadius: Radius.xxl,
  },
  glowGradient: {
    flex: 1,
    borderRadius: Radius.xxl,
  },
  timerContainer: {
    width: 300,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.primaryDim,
  },
  timerBg: {
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitGroup: {
    alignItems: 'center',
    minWidth: 70,
  },
  digit: {
    fontFamily: 'monospace',
    fontSize: Fonts.hero,
    fontWeight: Fonts.black,
    color: Colors.textSecondary,
    letterSpacing: 2,
  },
  digitActive: {
    color: Colors.primary,
    textShadowColor: Colors.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  label: {
    fontSize: Fonts.xs,
    fontWeight: Fonts.semibold,
    color: Colors.textMuted,
    letterSpacing: 3,
    marginTop: Spacing.xs,
  },
  separator: {
    fontFamily: 'monospace',
    fontSize: Fonts.display,
    fontWeight: Fonts.bold,
    color: Colors.textMuted,
    marginBottom: 18,
    marginHorizontal: Spacing.xs,
  },
  separatorActive: {
    color: Colors.primary,
    textShadowColor: Colors.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    backgroundColor: 'rgba(239,68,68,0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    marginRight: Spacing.sm,
  },
  liveText: {
    fontSize: Fonts.xs,
    fontWeight: Fonts.bold,
    color: Colors.error,
    letterSpacing: 2,
  },
});
