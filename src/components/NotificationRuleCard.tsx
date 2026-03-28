// NotificationRuleCard — Configurable break reminder rule
import React from 'react';
import { View, Text, StyleSheet, Pressable, Switch, TextInput } from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { BreakRule } from '../services/notificationService';

interface NotificationRuleCardProps {
  rule: BreakRule;
  onToggle: (enabled: boolean) => void;
  onDelete?: () => void;
  onUpdateMessage?: (message: string) => void;
  onUpdateInterval?: (minutes: number) => void;
}

export default function NotificationRuleCard({
  rule,
  onToggle,
  onDelete,
  onUpdateMessage,
  onUpdateInterval,
}: NotificationRuleCardProps) {
  const formatInterval = (mins: number) => {
    if (mins < 60) return `Every ${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (m === 0) return `Every ${h} hour${h > 1 ? 's' : ''}`;
    return `Every ${h}h ${m}m`;
  };

  return (
    <View style={[styles.card, rule.enabled && styles.cardActive]}>
      <View style={styles.header}>
        <View style={styles.intervalContainer}>
          <MaterialCommunityIcons
            name="bell-ring-outline"
            size={20}
            color={rule.enabled ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.interval, rule.enabled && styles.intervalActive]}>
            {formatInterval(rule.intervalMinutes)}
          </Text>
        </View>
        <View style={styles.actions}>
          {onDelete && (
            <Pressable onPress={onDelete} style={styles.deleteBtn}>
              <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.error} />
            </Pressable>
          )}
          <Switch
            value={rule.enabled}
            onValueChange={onToggle}
            trackColor={{ false: Colors.backgroundTertiary, true: Colors.primaryDim }}
            thumbColor={rule.enabled ? Colors.primary : Colors.textMuted}
          />
        </View>
      </View>

      <Text style={styles.message} numberOfLines={2}>{rule.message}</Text>

      {rule.enabled && (
        <View style={styles.options}>
          <View style={styles.option}>
            <MaterialCommunityIcons
              name={rule.sound ? 'volume-high' : 'volume-off'}
              size={14}
              color={rule.sound ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.optionText, rule.sound && styles.optionActive]}>Sound</Text>
          </View>
          <View style={styles.option}>
            <MaterialCommunityIcons
              name={rule.vibrate ? 'vibrate' : 'vibrate-off'}
              size={14}
              color={rule.vibrate ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.optionText, rule.vibrate && styles.optionActive]}>Vibrate</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardActive: {
    borderColor: 'rgba(0,240,255,0.2)',
    backgroundColor: 'rgba(0,240,255,0.03)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  intervalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  interval: {
    fontSize: Fonts.lg,
    fontWeight: Fonts.bold,
    color: Colors.textMuted,
  },
  intervalActive: {
    color: Colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  deleteBtn: {
    padding: Spacing.xs,
  },
  message: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  options: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  optionText: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
    fontWeight: Fonts.medium,
  },
  optionActive: {
    color: Colors.primary,
  },
});
