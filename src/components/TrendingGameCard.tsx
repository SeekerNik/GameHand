// TrendingGameCard — Discover screen game card with review scores
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type SteamSpyGame, getReviewScore, formatPrice } from '../services/steamspyApi';

interface TrendingGameCardProps {
  game: SteamSpyGame;
  rank?: number;
  onPress?: () => void;
}

export default function TrendingGameCard({ game, rank, onPress }: TrendingGameCardProps) {
  const [imgError, setImgError] = useState(false);
  const review = getReviewScore(game.positive, game.negative);
  const price = formatPrice(game.price);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        {!imgError ? (
          <Image
            source={{ uri: game.headerImage }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <LinearGradient colors={[Colors.surface, Colors.backgroundTertiary]} style={styles.imageFallback}>
            <MaterialCommunityIcons name="gamepad-variant" size={32} color={Colors.textMuted} />
          </LinearGradient>
        )}

        {/* Rank badge */}
        {rank !== undefined && (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{rank}</Text>
          </View>
        )}

        {/* Price badge */}
        <View style={[styles.priceBadge, price === 'Free' && styles.freeBadge]}>
          <Text style={[styles.priceText, price === 'Free' && styles.freeText]}>{price}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{game.name}</Text>
        <Text style={styles.developer} numberOfLines={1}>{game.developer}</Text>

        <View style={styles.metaRow}>
          {/* Review score */}
          <View style={styles.reviewBadge}>
            <MaterialCommunityIcons
              name={review.percent >= 70 ? 'thumb-up' : review.percent >= 40 ? 'thumbs-up-down' : 'thumb-down'}
              size={12}
              color={review.color}
            />
            <Text style={[styles.reviewText, { color: review.color }]}>{review.percent}%</Text>
          </View>

          {/* CCU */}
          {game.ccu > 0 && (
            <View style={styles.ccuBadge}>
              <MaterialCommunityIcons name="account-group" size={12} color={Colors.textMuted} />
              <Text style={styles.ccuText}>{game.ccu.toLocaleString()}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  imageContainer: {
    height: 94,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  rankText: {
    fontSize: Fonts.xs,
    fontWeight: Fonts.bold,
    color: Colors.primary,
  },
  priceBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  freeBadge: {
    backgroundColor: 'rgba(34,197,94,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.4)',
  },
  priceText: {
    fontSize: Fonts.xs,
    fontWeight: Fonts.bold,
    color: Colors.textPrimary,
  },
  freeText: {
    color: Colors.success,
  },
  content: {
    padding: Spacing.md,
  },
  name: {
    fontSize: Fonts.md,
    fontWeight: Fonts.bold,
    color: Colors.textPrimary,
  },
  developer: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  reviewText: {
    fontSize: Fonts.xs,
    fontWeight: Fonts.semibold,
  },
  ccuBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ccuText: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
  },
});
