// Home Screen — Session Timer with animated clock, stats, and PC status
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../constants/theme';
import { useTimer } from '../hooks/useTimer';
import { useAppContext } from '../context/AppContext';
import TimerDisplay from '../components/TimerDisplay';
import PCStatusBadge from '../components/PCStatusBadge';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { time, isRunning, seconds, start, stop, reset, sessionStats } = useTimer();
  const { state } = useAppContext();

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    start();
  };

  const handleStop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    stop();
  };

  const handleReset = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    reset();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>GameHand</Text>
            <Text style={styles.subtitle}>Session Tracker</Text>
          </View>
          <PCStatusBadge
            compact
            connected={state.pcStatus.connected}
            currentGame={state.pcStatus.currentGame}
            onPress={() => router.push('/pc-connect')}
          />
        </View>

        {/* Timer */}
        <TimerDisplay
          hours={time.hours}
          minutes={time.minutes}
          seconds={time.seconds}
          isRunning={isRunning}
        />

        {/* Controls */}
        <View style={styles.controls}>
          {!isRunning ? (
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
              onPress={handleStart}
            >
              <LinearGradient
                colors={Colors.gradientPrimary}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialCommunityIcons name="play" size={28} color={Colors.textInverse} />
                <Text style={styles.btnText}>Start Session</Text>
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.stopBtn, pressed && styles.btnPressed]}
              onPress={handleStop}
            >
              <MaterialCommunityIcons name="pause" size={28} color={Colors.error} />
              <Text style={[styles.btnText, { color: Colors.error }]}>Pause</Text>
            </Pressable>
          )}

          {seconds > 0 && !isRunning && (
            <Pressable
              style={({ pressed }) => [styles.resetBtn, pressed && styles.btnPressed]}
              onPress={handleReset}
            >
              <MaterialCommunityIcons name="refresh" size={22} color={Colors.textMuted} />
              <Text style={[styles.btnTextSmall, { color: Colors.textMuted }]}>Reset</Text>
            </Pressable>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Today's Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient colors={['rgba(0,240,255,0.08)', 'transparent']} style={styles.statCardBg}>
                <MaterialCommunityIcons name="clock-outline" size={24} color={Colors.primary} />
                <Text style={styles.statValue}>{Math.floor(sessionStats.totalMinutesToday / 60)}h {sessionStats.totalMinutesToday % 60}m</Text>
                <Text style={styles.statLabel}>Total Today</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient colors={['rgba(168,85,247,0.08)', 'transparent']} style={styles.statCardBg}>
                <MaterialCommunityIcons name="gamepad-variant" size={24} color={Colors.secondary} />
                <Text style={styles.statValue}>{sessionStats.sessionsToday}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient colors={['rgba(255,59,130,0.08)', 'transparent']} style={styles.statCardBg}>
                <MaterialCommunityIcons name="calendar-week" size={24} color={Colors.accent} />
                <Text style={styles.statValue}>{Math.floor(sessionStats.totalMinutesWeek / 60)}h</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Currently Playing (from PC) */}
        {state.pcStatus.connected && state.pcStatus.currentGame && (
          <View style={styles.nowPlaying}>
            <LinearGradient
              colors={['rgba(34,197,94,0.1)', 'transparent']}
              style={styles.nowPlayingBg}
            >
              <View style={styles.nowPlayingDot} />
              <View style={styles.nowPlayingInfo}>
                <Text style={styles.nowPlayingLabel}>NOW PLAYING ON PC</Text>
                <Text style={styles.nowPlayingGame}>{state.pcStatus.currentGame}</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Quick Actions */}
        {!state.isSetupComplete && (
          <Pressable
            style={styles.setupCard}
            onPress={() => router.push('/settings')}
          >
            <LinearGradient
              colors={['rgba(245,158,11,0.1)', 'rgba(245,158,11,0.05)']}
              style={styles.setupCardBg}
            >
              <MaterialCommunityIcons name="cog-outline" size={24} color={Colors.warning} />
              <View style={styles.setupInfo}>
                <Text style={styles.setupTitle}>Setup Required</Text>
                <Text style={styles.setupDesc}>Add your Steam API Key to unlock all features</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.warning} />
            </LinearGradient>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.section + 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Fonts.xxl,
    fontWeight: Fonts.black,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Fonts.md,
    color: Colors.textMuted,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xxxl,
  },
  primaryBtn: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    ...Shadow.card,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.full,
    backgroundColor: Colors.errorDim,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    gap: Spacing.sm,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  btnText: {
    fontSize: Fonts.lg,
    fontWeight: Fonts.bold,
    color: Colors.textInverse,
  },
  btnTextSmall: {
    fontSize: Fonts.sm,
    fontWeight: Fonts.semibold,
  },
  statsContainer: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Fonts.lg,
    fontWeight: Fonts.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statCardBg: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statValue: {
    fontSize: Fonts.xl,
    fontWeight: Fonts.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
    fontWeight: Fonts.medium,
  },
  nowPlaying: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
  },
  nowPlayingBg: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  nowPlayingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
  },
  nowPlayingInfo: {
    flex: 1,
  },
  nowPlayingLabel: {
    fontSize: Fonts.xs,
    fontWeight: Fonts.bold,
    color: Colors.success,
    letterSpacing: 2,
  },
  nowPlayingGame: {
    fontSize: Fonts.lg,
    fontWeight: Fonts.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  setupCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
  },
  setupCardBg: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  setupInfo: {
    flex: 1,
  },
  setupTitle: {
    fontSize: Fonts.md,
    fontWeight: Fonts.bold,
    color: Colors.warning,
  },
  setupDesc: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
