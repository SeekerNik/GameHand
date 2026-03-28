// Games Screen — Steam library browser with search, sort, and launch
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { getOwnedGames, type SteamGame } from '../services/steamApi';
import GameCard from '../components/GameCard';
import wsService from '../services/websocketService';
import { router } from 'expo-router';

type SortMode = 'name' | 'playtime' | 'recent';

export default function GamesScreen() {
  const { state, dispatch } = useAppContext();
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const loadGames = useCallback(async () => {
    if (!state.steamApiKey || !state.steamId) return;
    dispatch({ type: 'SET_GAMES_LOADING', payload: true });
    const games = await getOwnedGames(state.steamApiKey, state.steamId);
    dispatch({ type: 'SET_STEAM_GAMES', payload: games });
  }, [state.steamApiKey, state.steamId, dispatch]);

  useEffect(() => {
    if (state.steamGames.length === 0 && state.steamApiKey) {
      loadGames();
    }
  }, [state.steamApiKey]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGames();
    setRefreshing(false);
  };

  const filteredGames = useMemo(() => {
    let games = [...state.steamGames];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      games = games.filter(g => g.name.toLowerCase().includes(q));
    }

    // Sort
    switch (sortMode) {
      case 'name':
        games.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'playtime':
        games.sort((a, b) => b.playtime_forever - a.playtime_forever);
        break;
      case 'recent':
        games.sort((a, b) => (b.playtime_2weeks || 0) - (a.playtime_2weeks || 0));
        break;
    }

    return games;
  }, [state.steamGames, search, sortMode]);

  const handleLaunch = (game: SteamGame) => {
    wsService.launchGame(game.appid);
  };

  if (!state.steamApiKey || !state.steamId) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[Colors.background, Colors.backgroundSecondary]} style={StyleSheet.absoluteFill} />
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="steam" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Connect Your Steam</Text>
          <Text style={styles.emptyDesc}>Add your Steam API Key and Steam ID in Settings to see your game library</Text>
          <Pressable style={styles.goSettingsBtn} onPress={() => router.push('/settings')}>
            <LinearGradient
              colors={Colors.gradientPrimary}
              style={styles.goSettingsBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.goSettingsBtnText}>Go to Settings</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.backgroundSecondary]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Games</Text>
          <Text style={styles.subtitle}>{state.steamGames.length} games in library</Text>
        </View>
        <Pressable
          style={styles.viewToggle}
          onPress={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
        >
          <MaterialCommunityIcons
            name={viewMode === 'grid' ? 'view-list' : 'view-grid'}
            size={22}
            color={Colors.textSecondary}
          />
        </Pressable>
      </View>

      {/* Search + Sort */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search games..."
            placeholderTextColor={Colors.textMuted}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Sort Tabs */}
      <View style={styles.sortRow}>
        {(['recent', 'playtime', 'name'] as SortMode[]).map(mode => (
          <Pressable
            key={mode}
            style={[styles.sortTab, sortMode === mode && styles.sortTabActive]}
            onPress={() => setSortMode(mode)}
          >
            <Text style={[styles.sortTabText, sortMode === mode && styles.sortTabTextActive]}>
              {mode === 'recent' ? 'Recent' : mode === 'playtime' ? 'Most Played' : 'A-Z'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Game List */}
      {state.gamesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your library...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredGames}
          keyExtractor={item => item.appid.toString()}
          renderItem={({ item }) => (
            <GameCard
              game={item}
              compact={viewMode === 'list'}
              pcConnected={state.pcStatus.connected}
              onLaunch={() => handleLaunch(item)}
              onPress={() => {}}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <MaterialCommunityIcons name="gamepad-variant-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyListText}>
                {search ? 'No games match your search' : 'No games found'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.section + 20,
    marginBottom: Spacing.lg,
  },
  title: { fontSize: Fonts.xxl, fontWeight: Fonts.black, color: Colors.textPrimary },
  subtitle: { fontSize: Fonts.sm, color: Colors.textMuted, marginTop: 2 },
  viewToggle: {
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchRow: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Fonts.md,
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sortTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortTabActive: {
    backgroundColor: Colors.primaryDim,
    borderColor: 'rgba(0,240,255,0.3)',
  },
  sortTabText: { fontSize: Fonts.sm, fontWeight: Fonts.medium, color: Colors.textMuted },
  sortTabTextActive: { color: Colors.primary, fontWeight: Fonts.bold },
  listContent: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadingText: { fontSize: Fonts.md, color: Colors.textMuted },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
    gap: Spacing.lg,
  },
  emptyTitle: { fontSize: Fonts.xl, fontWeight: Fonts.bold, color: Colors.textPrimary },
  emptyDesc: { fontSize: Fonts.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  goSettingsBtn: { borderRadius: Radius.full, overflow: 'hidden', marginTop: Spacing.md },
  goSettingsBtnGrad: { paddingHorizontal: Spacing.xxxl, paddingVertical: Spacing.md },
  goSettingsBtnText: { fontSize: Fonts.md, fontWeight: Fonts.bold, color: Colors.textInverse },
  emptyList: { alignItems: 'center', paddingTop: Spacing.section, gap: Spacing.md },
  emptyListText: { fontSize: Fonts.md, color: Colors.textMuted },
});
