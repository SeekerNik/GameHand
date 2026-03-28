// PCStatusBadge — Connection status indicator
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PCStatusBadgeProps {
  connected: boolean;
  pcName?: string | null;
  currentGame?: string | null;
  onPress?: () => void;
  compact?: boolean;
}

export default function PCStatusBadge({ connected, pcName, currentGame, onPress, compact = false }: PCStatusBadgeProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (connected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [connected]);

  if (compact) {
    return (
      <Pressable onPress={onPress} style={[styles.compactBadge, connected ? styles.connectedBg : styles.disconnectedBg]}>
        <View style={[styles.dot, connected ? styles.dotConnected : styles.dotDisconnected]} />
        <Text style={styles.compactText}>
          {connected ? (currentGame || 'PC Connected') : 'PC Offline'}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={[styles.badge, connected ? styles.connectedBg : styles.disconnectedBg]}>
      <View style={styles.iconRow}>
        <View style={styles.dotContainer}>
          <Animated.View style={[styles.dotGlow, connected && styles.dotGlowActive, { transform: [{ scale: pulseAnim }] }]} />
          <View style={[styles.dot, connected ? styles.dotConnected : styles.dotDisconnected]} />
        </View>
        <MaterialCommunityIcons
          name={connected ? 'desktop-tower-monitor' : 'desktop-tower-monitor'}
          size={20}
          color={connected ? Colors.primary : Colors.textMuted}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.statusText, connected && styles.statusTextConnected]}>
          {connected ? 'PC Connected' : 'Not Connected'}
        </Text>
        {connected && pcName && (
          <Text style={styles.pcName}>{pcName}</Text>
        )}
        {connected && currentGame && (
          <Text style={styles.gameText}>
            <MaterialCommunityIcons name="gamepad-variant" size={11} color={Colors.success} />
            {'  '}{currentGame}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  connectedBg: {
    backgroundColor: Colors.primaryDim,
    borderColor: 'rgba(0,240,255,0.2)',
  },
  disconnectedBg: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginRight: Spacing.md,
  },
  dotContainer: {
    position: 'relative',
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotConnected: {
    backgroundColor: Colors.success,
  },
  dotDisconnected: {
    backgroundColor: Colors.textMuted,
  },
  dotGlow: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  dotGlowActive: {
    backgroundColor: 'rgba(34,197,94,0.3)',
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: Fonts.md,
    fontWeight: Fonts.semibold,
    color: Colors.textMuted,
  },
  statusTextConnected: {
    color: Colors.primary,
  },
  pcName: {
    fontSize: Fonts.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  gameText: {
    fontSize: Fonts.sm,
    color: Colors.success,
    fontWeight: Fonts.medium,
    marginTop: Spacing.xs,
  },
  // Compact
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    gap: Spacing.sm,
    borderWidth: 1,
  },
  compactText: {
    fontSize: Fonts.xs,
    fontWeight: Fonts.semibold,
    color: Colors.textSecondary,
  },
});
