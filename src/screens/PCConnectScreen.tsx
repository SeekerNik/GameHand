// PC Connect Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import wsService from '../services/websocketService';
import PCStatusBadge from '../components/PCStatusBadge';

export default function PCConnectScreen() {
  const { state, dispatch } = useAppContext();
  const [ipInput, setIpInput] = useState(state.pcIpAddress || '');
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const unsub1 = wsService.onStatusChange((connected) => {
      dispatch({ type: 'SET_PC_STATUS', payload: { connected } });
      setConnecting(false);
    });
    const unsub2 = wsService.onMessage('status_update', (data) => {
      dispatch({ type: 'SET_PC_STATUS', payload: {
        currentGame: data.currentGame || null,
        currentGameAppId: data.currentGameAppId || null,
        sessionDuration: data.sessionDuration || 0,
        pcName: data.pcName || null,
      }});
    });
    const unsub3 = wsService.onMessage('game_changed', (data) => {
      dispatch({ type: 'SET_PC_STATUS', payload: {
        currentGame: data.gameName || null, currentGameAppId: data.appid || null,
      }});
    });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [dispatch]);

  const handleConnect = () => {
    const ip = ipInput.trim();
    if (!ip) { Alert.alert('Enter IP', 'Enter the IP address of your PC'); return; }
    dispatch({ type: 'SET_PC_IP', payload: ip });
    setConnecting(true);
    wsService.connect(ip);
  };

  const handleDisconnect = () => {
    wsService.disconnect();
    dispatch({ type: 'SET_PC_STATUS', payload: { connected: false, currentGame: null, currentGameAppId: null, sessionDuration: 0 }});
  };

  const fmtDur = (s: number) => { const h = Math.floor(s/3600); const m = Math.floor((s%3600)/60); return h > 0 ? `${h}h ${m}m` : `${m}m`; };

  return (
    <View style={s.container}>
      <LinearGradient colors={[Colors.background, Colors.backgroundSecondary]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>PC Connect</Text>
        <Text style={s.subtitle}>Control your gaming PC remotely</Text>

        <View style={{ marginVertical: Spacing.xxl }}>
          <PCStatusBadge connected={state.pcStatus.connected} pcName={state.pcStatus.pcName} currentGame={state.pcStatus.currentGame} />
        </View>

        {!state.pcStatus.connected ? (
          <>
            <View style={s.card}>
              <Text style={s.cardTitle}>Connect to PC Agent</Text>
              <Text style={s.cardDesc}>Run the GameHand PC Agent on your computer, then enter the IP address shown.</Text>
              <View style={s.inputRow}>
                <TextInput style={s.input} value={ipInput} onChangeText={setIpInput} placeholder="192.168.1.100" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
                <Pressable style={[s.connectBtn, connecting && {opacity:0.6}]} onPress={handleConnect} disabled={connecting}>
                  <LinearGradient colors={Colors.gradientPrimary} style={s.connectGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                    <Text style={s.connectText}>{connecting ? 'Connecting...' : 'Connect'}</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
            <View style={s.card}>
              <Text style={s.cardTitle}>Setup Instructions</Text>
              {['Install Node.js on your PC','Navigate to pc-agent folder','Run: npm install && node agent.js','Enter IP shown in agent above'].map((t,i) => (
                <View key={i} style={s.step}>
                  <View style={s.stepNum}><Text style={s.stepNumText}>{i+1}</Text></View>
                  <Text style={s.stepText}>{t}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <View style={s.statsRow}>
              <View style={s.statCard}><MaterialCommunityIcons name="desktop-tower-monitor" size={28} color={Colors.primary} /><Text style={s.statVal}>{state.pcStatus.pcName||'PC'}</Text><Text style={s.statLbl}>Connected</Text></View>
              <View style={s.statCard}><MaterialCommunityIcons name="clock-outline" size={28} color={Colors.success} /><Text style={s.statVal}>{fmtDur(state.pcStatus.sessionDuration)}</Text><Text style={s.statLbl}>Session</Text></View>
            </View>
            {state.pcStatus.currentGame && (
              <View style={s.nowPlaying}><View style={s.npDot}/><View><Text style={s.npLabel}>NOW PLAYING</Text><Text style={s.npGame}>{state.pcStatus.currentGame}</Text></View></View>
            )}
            <Pressable style={s.disconnectBtn} onPress={handleDisconnect}>
              <MaterialCommunityIcons name="link-off" size={20} color={Colors.error} />
              <Text style={s.disconnectText}>Disconnect</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.section + 20, paddingBottom: 100 },
  title: { fontSize: Fonts.xxl, fontWeight: Fonts.black, color: Colors.textPrimary },
  subtitle: { fontSize: Fonts.md, color: Colors.textMuted, marginTop: 4 },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xl },
  cardTitle: { fontSize: Fonts.lg, fontWeight: Fonts.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  cardDesc: { fontSize: Fonts.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.lg },
  inputRow: { flexDirection: 'row', gap: Spacing.md },
  input: { flex: 1, backgroundColor: Colors.backgroundTertiary, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, color: Colors.textPrimary, fontSize: Fonts.md, borderWidth: 1, borderColor: Colors.border },
  connectBtn: { borderRadius: Radius.md, overflow: 'hidden' },
  connectGrad: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, justifyContent: 'center' },
  connectText: { fontSize: Fonts.md, fontWeight: Fonts.bold, color: Colors.textInverse },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.lg },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryDim, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontSize: Fonts.sm, fontWeight: Fonts.bold, color: Colors.primary },
  stepText: { flex: 1, fontSize: Fonts.md, color: Colors.textSecondary, lineHeight: 22 },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  statCard: { flex: 1, borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  statVal: { fontSize: Fonts.xl, fontWeight: Fonts.bold, color: Colors.textPrimary },
  statLbl: { fontSize: Fonts.xs, color: Colors.textMuted },
  nowPlaying: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.xl, borderRadius: Radius.lg, backgroundColor: Colors.successDim, borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', marginBottom: Spacing.lg },
  npDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success },
  npLabel: { fontSize: Fonts.xs, fontWeight: Fonts.bold, color: Colors.success, letterSpacing: 2 },
  npGame: { fontSize: Fonts.xxl, fontWeight: Fonts.bold, color: Colors.textPrimary, marginTop: 2 },
  disconnectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.lg, borderRadius: Radius.lg, backgroundColor: Colors.errorDim, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  disconnectText: { fontSize: Fonts.md, fontWeight: Fonts.bold, color: Colors.error },
});
