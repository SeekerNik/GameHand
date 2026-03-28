// Notifications Screen — Break reminder configuration
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import NotificationRuleCard from '../components/NotificationRuleCard';
import {
  requestPermissions,
  scheduleBreakReminder,
  cancelAllNotifications,
  type BreakRule,
} from '../services/notificationService';

export default function NotificationsScreen() {
  const { state, dispatch } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInterval, setNewInterval] = useState('45');
  const [newMessage, setNewMessage] = useState('');

  // Apply notification schedule whenever rules change
  useEffect(() => {
    applyRules();
  }, [state.breakRules, state.notificationsEnabled]);

  const applyRules = async () => {
    await cancelAllNotifications();
    if (!state.notificationsEnabled) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    for (const rule of state.breakRules) {
      if (rule.enabled) {
        await scheduleBreakReminder(rule);
      }
    }
  };

  const toggleRule = (ruleId: string, enabled: boolean) => {
    const updated = state.breakRules.map(r =>
      r.id === ruleId ? { ...r, enabled } : r
    );
    dispatch({ type: 'SET_BREAK_RULES', payload: updated });
  };

  const deleteRule = (ruleId: string) => {
    const updated = state.breakRules.filter(r => r.id !== ruleId);
    dispatch({ type: 'SET_BREAK_RULES', payload: updated });
  };

  const addRule = () => {
    const mins = parseInt(newInterval);
    if (isNaN(mins) || mins < 1) {
      Alert.alert('Invalid', 'Enter a valid number of minutes');
      return;
    }

    const rule: BreakRule = {
      id: `rule-custom-${Date.now()}`,
      intervalMinutes: mins,
      message: newMessage || `Time for a break after ${mins} minutes! 🎮`,
      enabled: true,
      sound: true,
      vibrate: true,
    };

    dispatch({ type: 'SET_BREAK_RULES', payload: [...state.breakRules, rule] });
    setShowAddForm(false);
    setNewInterval('45');
    setNewMessage('');
  };

  const activeCount = state.breakRules.filter(r => r.enabled).length;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Break Reminders</Text>
          <Text style={styles.subtitle}>Stay healthy while gaming</Text>
        </View>

        {/* Master Toggle */}
        <View style={styles.masterToggle}>
          <View style={styles.masterInfo}>
            <MaterialCommunityIcons
              name={state.notificationsEnabled ? 'bell-ring' : 'bell-off'}
              size={24}
              color={state.notificationsEnabled ? Colors.primary : Colors.textMuted}
            />
            <View>
              <Text style={styles.masterLabel}>Notifications</Text>
              <Text style={styles.masterSubLabel}>
                {state.notificationsEnabled
                  ? `${activeCount} active reminder${activeCount !== 1 ? 's' : ''}`
                  : 'All reminders paused'}
              </Text>
            </View>
          </View>
          <Switch
            value={state.notificationsEnabled}
            onValueChange={(v) => dispatch({ type: 'TOGGLE_NOTIFICATIONS', payload: v })}
            trackColor={{ false: Colors.backgroundTertiary, true: Colors.primaryDim }}
            thumbColor={state.notificationsEnabled ? Colors.primary : Colors.textMuted}
          />
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <MaterialCommunityIcons name="information-outline" size={16} color={Colors.primary} />
          <Text style={styles.infoText}>
            Reminders repeat at your chosen intervals while a gaming session is active. Start a session on the Home tab.
          </Text>
        </View>

        {/* Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rules</Text>
          {state.breakRules.map(rule => (
            <NotificationRuleCard
              key={rule.id}
              rule={rule}
              onToggle={(enabled) => toggleRule(rule.id, enabled)}
              onDelete={() => deleteRule(rule.id)}
            />
          ))}
        </View>

        {/* Add Rule */}
        {!showAddForm ? (
          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
            onPress={() => setShowAddForm(true)}
          >
            <MaterialCommunityIcons name="plus-circle-outline" size={22} color={Colors.primary} />
            <Text style={styles.addBtnText}>Add New Rule</Text>
          </Pressable>
        ) : (
          <View style={styles.addForm}>
            <Text style={styles.addFormTitle}>New Break Rule</Text>

            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Every</Text>
              <TextInput
                style={styles.formInput}
                value={newInterval}
                onChangeText={setNewInterval}
                keyboardType="number-pad"
                placeholderTextColor={Colors.textMuted}
                maxLength={4}
              />
              <Text style={styles.formLabel}>minutes</Text>
            </View>

            <TextInput
              style={styles.formInputFull}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Custom message (optional)"
              placeholderTextColor={Colors.textMuted}
              maxLength={100}
            />

            <View style={styles.formActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setShowAddForm(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={addRule}>
                <LinearGradient
                  colors={Colors.gradientPrimary}
                  style={styles.saveBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.saveBtnText}>Add Rule</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}

        {/* Quick Presets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Presets</Text>
          <View style={styles.presets}>
            {[
              { mins: 15, label: '15m', emoji: '⚡' },
              { mins: 30, label: '30m', emoji: '👀' },
              { mins: 45, label: '45m', emoji: '🧘' },
              { mins: 60, label: '1h', emoji: '🦵' },
              { mins: 90, label: '90m', emoji: '☕' },
              { mins: 120, label: '2h', emoji: '💧' },
            ].map(preset => {
              const exists = state.breakRules.some(r => r.intervalMinutes === preset.mins);
              return (
                <Pressable
                  key={preset.mins}
                  style={[styles.presetBtn, exists && styles.presetBtnDisabled]}
                  disabled={exists}
                  onPress={() => {
                    const rule: BreakRule = {
                      id: `rule-${preset.mins}-${Date.now()}`,
                      intervalMinutes: preset.mins,
                      message: `${preset.emoji} ${preset.label} break! Time to stretch and rest your eyes.`,
                      enabled: true,
                      sound: true,
                      vibrate: true,
                    };
                    dispatch({ type: 'SET_BREAK_RULES', payload: [...state.breakRules, rule] });
                  }}
                >
                  <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                  <Text style={[styles.presetLabel, exists && styles.presetLabelDisabled]}>{preset.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.section + 20,
    paddingBottom: 100,
  },
  header: { marginBottom: Spacing.xxl },
  title: { fontSize: Fonts.xxl, fontWeight: Fonts.black, color: Colors.textPrimary },
  subtitle: { fontSize: Fonts.md, color: Colors.textMuted, marginTop: 4 },
  masterToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  masterInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  masterLabel: { fontSize: Fonts.lg, fontWeight: Fonts.bold, color: Colors.textPrimary },
  masterSubLabel: { fontSize: Fonts.xs, color: Colors.textMuted, marginTop: 2 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryDim,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  infoText: { flex: 1, fontSize: Fonts.sm, color: Colors.textSecondary, lineHeight: 20 },
  section: { marginBottom: Spacing.xxl },
  sectionTitle: { fontSize: Fonts.lg, fontWeight: Fonts.bold, color: Colors.textPrimary, marginBottom: Spacing.lg },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primaryDim,
    borderStyle: 'dashed',
    marginBottom: Spacing.xxl,
  },
  addBtnPressed: { backgroundColor: Colors.primaryDim },
  addBtnText: { fontSize: Fonts.md, fontWeight: Fonts.semibold, color: Colors.primary },
  addForm: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addFormTitle: { fontSize: Fonts.lg, fontWeight: Fonts.bold, color: Colors.textPrimary, marginBottom: Spacing.lg },
  formRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  formLabel: { fontSize: Fonts.md, color: Colors.textSecondary },
  formInput: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: Fonts.xl,
    fontWeight: Fonts.bold,
    width: 80,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formInputFull: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Fonts.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formActions: { flexDirection: 'row', gap: Spacing.md },
  cancelBtn: { flex: 1, padding: Spacing.md, alignItems: 'center', borderRadius: Radius.md, backgroundColor: Colors.backgroundTertiary },
  cancelBtnText: { fontSize: Fonts.md, color: Colors.textMuted, fontWeight: Fonts.semibold },
  saveBtn: { flex: 1, borderRadius: Radius.md, overflow: 'hidden' },
  saveBtnGradient: { padding: Spacing.md, alignItems: 'center' },
  saveBtnText: { fontSize: Fonts.md, color: Colors.textInverse, fontWeight: Fonts.bold },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  presetBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    width: 80,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetBtnDisabled: { opacity: 0.4 },
  presetEmoji: { fontSize: 24, marginBottom: Spacing.xs },
  presetLabel: { fontSize: Fonts.md, fontWeight: Fonts.bold, color: Colors.textPrimary },
  presetLabelDisabled: { color: Colors.textMuted },
});
