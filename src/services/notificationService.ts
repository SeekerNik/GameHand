// Notification Service — Schedule break reminders
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface BreakRule {
  id: string;
  intervalMinutes: number;
  message: string;
  enabled: boolean;
  sound: boolean;
  vibrate: boolean;
}

export async function requestPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Notification permissions not granted');
    return false;
  }

  // Create Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('break-reminders', {
      name: 'Break Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00F0FF',
      sound: 'default',
    });
  }

  return true;
}

export async function scheduleBreakReminder(rule: BreakRule): Promise<string | null> {
  if (!rule.enabled) return null;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎮 GameHand — Time for a Break!',
        body: rule.message || `You've been playing for ${rule.intervalMinutes} minutes. Take a stretch!`,
        sound: rule.sound ? 'default' : undefined,
        data: { ruleId: rule.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: rule.intervalMinutes * 60,
        repeats: true,
      },
    });
    return id;
  } catch (err) {
    console.error('scheduleBreakReminder error:', err);
    return null;
  }
}

export async function cancelNotification(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    console.error('cancelNotification error:', err);
  }
}

export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err) {
    console.error('cancelAllNotifications error:', err);
  }
}

export async function getScheduledNotifications() {
  return Notifications.getAllScheduledNotificationsAsync();
}

// Default break rules
export function getDefaultRules(): BreakRule[] {
  return [
    {
      id: 'rule-30',
      intervalMinutes: 30,
      message: "30 minutes in! Quick eye break 👀",
      enabled: false,
      sound: true,
      vibrate: true,
    },
    {
      id: 'rule-60',
      intervalMinutes: 60,
      message: "1 hour gaming session! Stretch your legs 🦵",
      enabled: true,
      sound: true,
      vibrate: true,
    },
    {
      id: 'rule-120',
      intervalMinutes: 120,
      message: "2 hours! Time for a real break — hydrate & move 💧",
      enabled: false,
      sound: true,
      vibrate: true,
    },
  ];
}
