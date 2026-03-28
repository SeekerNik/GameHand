// ProtonDB API Service — Linux compatibility data
// Uses the community-known endpoint

const PROTONDB_BASE = 'https://www.protondb.com/api/v1/reports/summaries';

export interface ProtonDBSummary {
  bestReportedTier: string;
  confidence: string;
  score: number;
  tier: string;
  total: number;
  trendingTier: string;
}

export type ProtonTier = 'platinum' | 'gold' | 'silver' | 'bronze' | 'borked' | 'pending' | 'native';

export async function getProtonDBRating(appid: number): Promise<ProtonDBSummary | null> {
  try {
    const url = `${PROTONDB_BASE}/${appid}.json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('getProtonDBRating error:', err);
    return null;
  }
}

export function getTierColor(tier: string): string {
  switch (tier?.toLowerCase()) {
    case 'native': return '#22C55E';
    case 'platinum': return '#E5E4E2';
    case 'gold': return '#FFD700';
    case 'silver': return '#C0C0C0';
    case 'bronze': return '#CD7F32';
    case 'borked': return '#EF4444';
    case 'pending': return '#64748B';
    default: return '#64748B';
  }
}

export function getTierEmoji(tier: string): string {
  switch (tier?.toLowerCase()) {
    case 'native': return '🐧';
    case 'platinum': return '💎';
    case 'gold': return '🥇';
    case 'silver': return '🥈';
    case 'bronze': return '🥉';
    case 'borked': return '💔';
    case 'pending': return '⏳';
    default: return '❓';
  }
}

export function getTierLabel(tier: string): string {
  if (!tier) return 'Unknown';
  return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
}
