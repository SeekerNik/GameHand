// Settings Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Linking, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { getPlayerSummary, getPersonaState, type SteamPlayer } from '../services/steamApi';

export default function SettingsScreen() {
  const { state, dispatch } = useAppContext();
  const [apiKey, setApiKey] = useState(state.steamApiKey);
  const [steamId, setSteamId] = useState(state.steamId);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<SteamPlayer | null>(state.steamPlayer);

  useEffect(() => {
    if (state.steamApiKey && state.steamId && !profile) { fetchProfile(); }
  }, []);

  const fetchProfile = async () => {
    const p = await getPlayerSummary(state.steamApiKey, state.steamId);
    if (p) { setProfile(p); dispatch({ type: 'SET_STEAM_PLAYER', payload: p }); }
  };

  const handleSave = async () => {
    if (!apiKey.trim() || !steamId.trim()) { Alert.alert('Missing info', 'Both API Key and Steam ID are required'); return; }
    setSaving(true);
    dispatch({ type: 'SET_STEAM_CREDENTIALS', payload: { apiKey: apiKey.trim(), steamId: steamId.trim() } });
    const p = await getPlayerSummary(apiKey.trim(), steamId.trim());
    if (p) {
      setProfile(p);
      dispatch({ type: 'SET_STEAM_PLAYER', payload: p });
      Alert.alert('Connected!', `Welcome, ${p.personaname}!`);
    } else {
      Alert.alert('Note', 'Credentials saved but could not verify. Check your API key and Steam ID.');
    }
    setSaving(false);
  };

  const persona = profile ? getPersonaState(profile.personastate) : null;

  return (
    <View style={s.container}>
      <LinearGradient colors={[Colors.background, Colors.backgroundSecondary]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Settings</Text>
        <Text style={s.subtitle}>Configure your GameHand</Text>

        {/* Profile Card */}
        {profile && (
          <View style={s.profileCard}>
            <Image source={{ uri: profile.avatarfull }} style={s.avatar} />
            <View style={s.profileInfo}>
              <Text style={s.profileName}>{profile.personaname}</Text>
              <View style={s.statusRow}>
                <View style={[s.statusDot, { backgroundColor: persona?.color }]} />
                <Text style={[s.statusText, { color: persona?.color }]}>{persona?.label}</Text>
              </View>
              {profile.gameextrainfo && <Text style={s.playingText}>🎮 {profile.gameextrainfo}</Text>}
            </View>
          </View>
        )}

        {/* Steam Credentials */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Steam Connection</Text>

          <View style={s.field}>
            <Text style={s.label}>Steam Web API Key</Text>
            <TextInput style={s.input} value={apiKey} onChangeText={setApiKey} placeholder="Your API key" placeholderTextColor={Colors.textMuted} secureTextEntry autoCapitalize="none" />
            <Pressable onPress={() => Linking.openURL('https://steamcommunity.com/dev/apikey')}>
              <Text style={s.link}>Get your API key →</Text>
            </Pressable>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Steam ID (64-bit)</Text>
            <TextInput style={s.input} value={steamId} onChangeText={setSteamId} placeholder="e.g. 76561198012345678" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
            <Pressable onPress={() => Linking.openURL('https://steamid.io')}>
              <Text style={s.link}>Find your Steam ID →</Text>
            </Pressable>
          </View>

          <Pressable style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
            <LinearGradient colors={Colors.gradientPrimary} style={s.saveGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
              <Text style={s.saveText}>{saving ? 'Verifying...' : 'Save & Verify'}</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* PC Agent */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>PC Agent</Text>
          <View style={s.infoCard}>
            <MaterialCommunityIcons name="desktop-tower-monitor" size={24} color={Colors.primary} />
            <View style={{flex:1}}>
              <Text style={s.infoTitle}>IP Address</Text>
              <Text style={s.infoValue}>{state.pcIpAddress || 'Not configured'}</Text>
            </View>
            <View style={[s.statusDot, { backgroundColor: state.pcStatus.connected ? Colors.success : Colors.textMuted }]} />
          </View>
        </View>

        {/* About */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>About</Text>
          <View style={s.aboutCard}>
            <Text style={s.aboutName}>GameHand</Text>
            <Text style={s.aboutVersion}>v1.0.0</Text>
            <Text style={s.aboutDesc}>Your ultimate gaming companion. Track sessions, manage your Steam library, and control your PC — all from your phone.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.section + 20, paddingBottom: 100 },
  title: { fontSize: Fonts.xxl, fontWeight: Fonts.black, color: Colors.textPrimary },
  subtitle: { fontSize: Fonts.md, color: Colors.textMuted, marginTop: 4, marginBottom: Spacing.xxl },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xxl, gap: Spacing.lg },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.backgroundTertiary },
  profileInfo: { flex: 1 },
  profileName: { fontSize: Fonts.xl, fontWeight: Fonts.bold, color: Colors.textPrimary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: Fonts.sm, fontWeight: Fonts.semibold },
  playingText: { fontSize: Fonts.sm, color: Colors.success, marginTop: 4 },
  section: { marginBottom: Spacing.xxl },
  sectionTitle: { fontSize: Fonts.lg, fontWeight: Fonts.bold, color: Colors.textPrimary, marginBottom: Spacing.lg },
  field: { marginBottom: Spacing.lg },
  label: { fontSize: Fonts.sm, fontWeight: Fonts.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.surface, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, color: Colors.textPrimary, fontSize: Fonts.md, borderWidth: 1, borderColor: Colors.border },
  link: { fontSize: Fonts.sm, color: Colors.primary, marginTop: Spacing.sm, fontWeight: Fonts.medium },
  saveBtn: { borderRadius: Radius.md, overflow: 'hidden', marginTop: Spacing.sm },
  saveGrad: { padding: Spacing.lg, alignItems: 'center' },
  saveText: { fontSize: Fonts.md, fontWeight: Fonts.bold, color: Colors.textInverse },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  infoTitle: { fontSize: Fonts.sm, color: Colors.textMuted },
  infoValue: { fontSize: Fonts.md, fontWeight: Fonts.semibold, color: Colors.textPrimary, marginTop: 2 },
  aboutCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  aboutName: { fontSize: Fonts.xxl, fontWeight: Fonts.black, color: Colors.primary },
  aboutVersion: { fontSize: Fonts.sm, color: Colors.textMuted, marginTop: 4 },
  aboutDesc: { fontSize: Fonts.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: Spacing.md },
});
