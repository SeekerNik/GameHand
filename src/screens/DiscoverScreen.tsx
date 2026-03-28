// Discover Screen — Trending games + news
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Pressable, ActivityIndicator, RefreshControl, Image, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { getTopGames, type SteamSpyGame, getReviewScore, formatPrice } from '../services/steamspyApi';
import { getProtonDBRating, getTierColor, getTierEmoji, getTierLabel } from '../services/protondbApi';
import TrendingGameCard from '../components/TrendingGameCard';

type Tab = 'trending' | 'protondb';

export default function DiscoverScreen() {
  const [tab, setTab] = useState<Tab>('trending');
  const [trending, setTrending] = useState<SteamSpyGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [protonResults, setProtonResults] = useState<Map<number, string>>(new Map());

  useEffect(() => { loadTrending(); }, []);

  const loadTrending = async () => {
    setLoading(true);
    const games = await getTopGames();
    setTrending(games);
    setLoading(false);
    // Fetch protondb ratings for top 20
    const top20 = games.slice(0, 20);
    const results = new Map<number, string>();
    for (const g of top20) {
      const r = await getProtonDBRating(g.appid);
      if (r) results.set(g.appid, r.tier);
    }
    setProtonResults(results);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrending();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.background, Colors.backgroundSecondary]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>

        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Trending games & Linux compatibility</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['trending', 'protondb'] as Tab[]).map(t => (
            <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <MaterialCommunityIcons
                name={t === 'trending' ? 'fire' : 'linux'}
                size={18}
                color={tab === t ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'trending' ? 'Trending' : 'ProtonDB'}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.loadingText}>Loading games...</Text></View>
        ) : tab === 'trending' ? (
          <>
            {/* Top 10 Horizontal */}
            <Text style={styles.sectionTitle}>🔥 Top Played This Week</Text>
            <FlatList
              data={trending.slice(0, 10)}
              horizontal
              keyExtractor={i => i.appid.toString()}
              renderItem={({ item, index }) => <TrendingGameCard game={item} rank={index + 1} />}
              showsHorizontalScrollIndicator={false}
              style={styles.horizList}
            />

            {/* Full List */}
            <Text style={styles.sectionTitle}>📊 All Trending</Text>
            {trending.map((game, idx) => {
              const review = getReviewScore(game.positive, game.negative);
              const protonTier = protonResults.get(game.appid);
              return (
                <Pressable key={game.appid} style={styles.listCard} onPress={() => Linking.openURL(`https://store.steampowered.com/app/${game.appid}`)}>
                  <Text style={styles.listRank}>#{idx+1}</Text>
                  <Image source={{ uri: game.headerImage }} style={styles.listImg} />
                  <View style={styles.listInfo}>
                    <Text style={styles.listName} numberOfLines={1}>{game.name}</Text>
                    <View style={styles.listMeta}>
                      <Text style={[styles.listReview, { color: review.color }]}>{review.percent}%</Text>
                      <Text style={styles.listPrice}>{formatPrice(game.price)}</Text>
                      {protonTier && (
                        <Text style={[styles.listProton, { color: getTierColor(protonTier) }]}>
                          {getTierEmoji(protonTier)} {getTierLabel(protonTier)}
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </>
        ) : (
          /* ProtonDB Tab */
          <>
            <View style={styles.protonHeader}>
              <MaterialCommunityIcons name="linux" size={40} color="#F5C518" />
              <Text style={styles.protonTitle}>Linux Gaming Compatibility</Text>
              <Text style={styles.protonDesc}>Check which trending games work on Linux via Proton</Text>
            </View>
            {/* Tier Legend */}
            <View style={styles.tierLegend}>
              {['native','platinum','gold','silver','bronze','borked'].map(t => (
                <View key={t} style={styles.tierItem}>
                  <Text style={styles.tierEmoji}>{getTierEmoji(t)}</Text>
                  <Text style={[styles.tierLabel, { color: getTierColor(t) }]}>{getTierLabel(t)}</Text>
                </View>
              ))}
            </View>
            {/* Games with ProtonDB */}
            {trending.filter(g => protonResults.has(g.appid)).map(game => {
              const tier = protonResults.get(game.appid)!;
              return (
                <View key={game.appid} style={styles.protonCard}>
                  <Image source={{ uri: game.headerImage }} style={styles.protonImg} />
                  <View style={styles.protonInfo}>
                    <Text style={styles.protonName} numberOfLines={1}>{game.name}</Text>
                    <View style={[styles.protonBadge, { borderColor: getTierColor(tier) }]}>
                      <Text style={styles.protonBadgeEmoji}>{getTierEmoji(tier)}</Text>
                      <Text style={[styles.protonBadgeText, { color: getTierColor(tier) }]}>{getTierLabel(tier)}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
            {trending.filter(g => protonResults.has(g.appid)).length === 0 && (
              <Text style={styles.noData}>Loading ProtonDB data...</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.section + 20, paddingBottom: 100 },
  title: { fontSize: Fonts.xxl, fontWeight: Fonts.black, color: Colors.textPrimary },
  subtitle: { fontSize: Fonts.md, color: Colors.textMuted, marginTop: 4, marginBottom: Spacing.xxl },
  tabs: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xxl },
  tab: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  tabActive: { backgroundColor: Colors.primaryDim, borderColor: 'rgba(0,240,255,0.3)' },
  tabText: { fontSize: Fonts.md, fontWeight: Fonts.medium, color: Colors.textMuted },
  tabTextActive: { color: Colors.primary, fontWeight: Fonts.bold },
  loading: { alignItems: 'center', paddingTop: Spacing.section, gap: Spacing.md },
  loadingText: { fontSize: Fonts.md, color: Colors.textMuted },
  sectionTitle: { fontSize: Fonts.lg, fontWeight: Fonts.bold, color: Colors.textPrimary, marginBottom: Spacing.lg, marginTop: Spacing.md },
  horizList: { marginBottom: Spacing.xxl, marginHorizontal: -Spacing.xl, paddingHorizontal: Spacing.xl },
  listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  listRank: { fontSize: Fonts.sm, fontWeight: Fonts.bold, color: Colors.textMuted, width: 32, textAlign: 'center' },
  listImg: { width: 80, height: 37, borderRadius: Radius.sm, backgroundColor: Colors.backgroundTertiary },
  listInfo: { flex: 1, marginLeft: Spacing.md },
  listName: { fontSize: Fonts.md, fontWeight: Fonts.semibold, color: Colors.textPrimary },
  listMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2 },
  listReview: { fontSize: Fonts.xs, fontWeight: Fonts.bold },
  listPrice: { fontSize: Fonts.xs, color: Colors.textMuted },
  listProton: { fontSize: Fonts.xs, fontWeight: Fonts.semibold },
  protonHeader: { alignItems: 'center', marginBottom: Spacing.xxl, gap: Spacing.sm },
  protonTitle: { fontSize: Fonts.xl, fontWeight: Fonts.bold, color: Colors.textPrimary },
  protonDesc: { fontSize: Fonts.sm, color: Colors.textSecondary, textAlign: 'center' },
  tierLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xxl, justifyContent: 'center' },
  tierItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tierEmoji: { fontSize: 16 },
  tierLabel: { fontSize: Fonts.xs, fontWeight: Fonts.semibold },
  protonCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  protonImg: { width: 80, height: 37, borderRadius: Radius.sm, backgroundColor: Colors.backgroundTertiary },
  protonInfo: { flex: 1, marginLeft: Spacing.md },
  protonName: { fontSize: Fonts.md, fontWeight: Fonts.semibold, color: Colors.textPrimary, marginBottom: 4 },
  protonBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2, alignSelf: 'flex-start' },
  protonBadgeEmoji: { fontSize: 12 },
  protonBadgeText: { fontSize: Fonts.xs, fontWeight: Fonts.bold },
  noData: { fontSize: Fonts.md, color: Colors.textMuted, textAlign: 'center', paddingTop: Spacing.xxl },
});
