// GameCard — Rich game card with artwork, playtime, and launch button
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { formatPlaytime, type SteamGame } from '../services/steamApi';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface GameCardProps {
  game: SteamGame;
  onPress?: () => void;
  onLaunch?: () => void;
  pcConnected?: boolean;
  compact?: boolean;
}

export default function GameCard({ game, onPress, onLaunch, pcConnected = false, compact = false }: GameCardProps) {
  const [imgError, setImgError] = useState(false);

  if (compact) {
    return (
      <Pressable
        style={({ pressed }) => [styles.compactCard, pressed && styles.pressed]}
        onPress={onPress}
      >
        <Image
          source={{ uri: game.headerImage }}
          style={styles.compactImage}
          onError={() => setImgError(true)}
        />
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>{game.name}</Text>
          <Text style={styles.compactPlaytime}>
            {formatPlaytime(game.playtime_forever)}
            {game.playtime_2weeks ? ` · ${formatPlaytime(game.playtime_2weeks)} recent` : ''}
          </Text>
        </View>
        {pcConnected && onLaunch && (
          <Pressable style={styles.compactLaunch} onPress={onLaunch}>
            <MaterialCommunityIcons name="play-circle" size={28} color={Colors.primary} />
          </Pressable>
        )}
      </Pressable>
    );
  }

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
            <MaterialCommunityIcons name="gamepad-variant" size={40} color={Colors.textMuted} />
          </LinearGradient>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.imageOverlay}
        />
        <View style={styles.imageContent}>
          <Text style={styles.gameName} numberOfLines={2}>{game.name}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.primary} />
            <Text style={styles.statText}>{formatPlaytime(game.playtime_forever)}</Text>
          </View>
          {game.playtime_2weeks !== undefined && game.playtime_2weeks > 0 && (
            <View style={styles.stat}>
              <MaterialCommunityIcons name="trending-up" size={14} color={Colors.success} />
              <Text style={[styles.statText, { color: Colors.success }]}>
                {formatPlaytime(game.playtime_2weeks)} last 2w
              </Text>
            </View>
          )}
        </View>

        {pcConnected && onLaunch && (
          <Pressable style={styles.launchBtn} onPress={onLaunch}>
            <MaterialCommunityIcons name="play" size={16} color={Colors.textInverse} />
            <Text style={styles.launchText}>Launch</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    height: 140,
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
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  imageContent: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
  },
  gameName: {
    fontSize: Fonts.lg,
    fontWeight: Fonts.bold,
    color: Colors.textPrimary,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  info: {
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.md,
    flex: 1,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
    fontWeight: Fonts.medium,
  },
  launchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  launchText: {
    fontSize: Fonts.sm,
    fontWeight: Fonts.bold,
    color: Colors.textInverse,
  },
  // Compact styles
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compactImage: {
    width: 64,
    height: 30,
    borderRadius: Radius.sm,
    backgroundColor: Colors.backgroundTertiary,
  },
  compactInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  compactName: {
    fontSize: Fonts.md,
    fontWeight: Fonts.semibold,
    color: Colors.textPrimary,
  },
  compactPlaytime: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  compactLaunch: {
    padding: Spacing.sm,
  },
});
