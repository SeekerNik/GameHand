// SteamSpy API Service — Free trending games data
// Uses https://steamspy.com/api.php

const STEAMSPY_BASE = 'https://steamspy.com/api.php';

export interface SteamSpyGame {
  appid: number;
  name: string;
  developer: string;
  publisher: string;
  score_rank: string;
  positive: number;
  negative: number;
  userscore: number;
  owners: string;
  average_forever: number; // average playtime in minutes
  average_2weeks: number;
  median_forever: number;
  median_2weeks: number;
  price: string;
  initialprice: string;
  discount: string;
  ccu: number; // concurrent users
  headerImage?: string;
}

export async function getTopGames(page = 0): Promise<SteamSpyGame[]> {
  try {
    const url = `${STEAMSPY_BASE}?request=top100in2weeks&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`SteamSpy error: ${res.status}`);
    const data = await res.json();
    return Object.values(data).map((g: any) => ({
      ...g,
      headerImage: `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
    }));
  } catch (err) {
    console.error('getTopGames error:', err);
    return [];
  }
}

export async function getTopOwned(): Promise<SteamSpyGame[]> {
  try {
    const url = `${STEAMSPY_BASE}?request=top100owned`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`SteamSpy error: ${res.status}`);
    const data = await res.json();
    return Object.values(data).map((g: any) => ({
      ...g,
      headerImage: `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
    }));
  } catch (err) {
    console.error('getTopOwned error:', err);
    return [];
  }
}

export async function getTopSellers(): Promise<SteamSpyGame[]> {
  try {
    const url = `${STEAMSPY_BASE}?request=top100forever`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`SteamSpy error: ${res.status}`);
    const data = await res.json();
    return Object.values(data).map((g: any) => ({
      ...g,
      headerImage: `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
    }));
  } catch (err) {
    console.error('getTopSellers error:', err);
    return [];
  }
}

export async function getGameDetails(appid: number): Promise<SteamSpyGame | null> {
  try {
    const url = `${STEAMSPY_BASE}?request=appdetails&appid=${appid}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`SteamSpy error: ${res.status}`);
    const data = await res.json();
    return { ...data, headerImage: `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg` };
  } catch (err) {
    console.error('getGameDetails error:', err);
    return null;
  }
}

export function formatOwners(owners: string): string {
  // e.g. "20,000,000 .. 50,000,000"
  return owners;
}

export function getReviewScore(positive: number, negative: number): { label: string; color: string; percent: number } {
  const total = positive + negative;
  if (total === 0) return { label: 'No Reviews', color: '#64748B', percent: 0 };
  const pct = Math.round((positive / total) * 100);
  if (pct >= 95) return { label: 'Overwhelmingly Positive', color: '#22C55E', percent: pct };
  if (pct >= 80) return { label: 'Very Positive', color: '#22C55E', percent: pct };
  if (pct >= 70) return { label: 'Mostly Positive', color: '#86EFAC', percent: pct };
  if (pct >= 40) return { label: 'Mixed', color: '#F59E0B', percent: pct };
  if (pct >= 20) return { label: 'Mostly Negative', color: '#EF4444', percent: pct };
  return { label: 'Overwhelmingly Negative', color: '#EF4444', percent: pct };
}

export function formatPrice(price: string): string {
  const p = parseInt(price);
  if (isNaN(p) || p === 0) return 'Free';
  return `$${(p / 100).toFixed(2)}`;
}
