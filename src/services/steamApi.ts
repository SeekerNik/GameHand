// Steam Web API Service
// Calls Steam API directly using user's API key stored on-device

const STEAM_BASE = 'https://api.steampowered.com';
const STEAM_STORE = 'https://store.steampowered.com';

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number; // minutes
  playtime_2weeks?: number; // minutes
  img_icon_url?: string;
  img_logo_url?: string;
  has_community_visible_stats?: boolean;
  headerImage?: string;
}

export interface SteamPlayer {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number;
  lastlogoff?: number;
  gameextrainfo?: string; // currently playing game
  gameid?: string;
  loccountrycode?: string;
}

export interface SteamNewsItem {
  gid: string;
  title: string;
  url: string;
  author: string;
  contents: string;
  date: number;
  feedlabel: string;
  appid: number;
  feedname: string;
}

function getHeaderImage(appid: number): string {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`;
}

function getCapsuleImage(appid: number): string {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/capsule_231x87.jpg`;
}

function getLibraryImage(appid: number): string {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/library_600x900_2x.jpg`;
}

export function getGameImages(appid: number) {
  return {
    header: getHeaderImage(appid),
    capsule: getCapsuleImage(appid),
    library: getLibraryImage(appid),
    icon: (iconHash: string) =>
      `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${iconHash}.jpg`,
  };
}

export async function getOwnedGames(
  apiKey: string,
  steamId: string
): Promise<SteamGame[]> {
  try {
    const url = `${STEAM_BASE}/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Steam API error: ${res.status}`);
    const data = await res.json();
    const games: SteamGame[] = (data?.response?.games || []).map((g: any) => ({
      ...g,
      headerImage: getHeaderImage(g.appid),
    }));
    // Sort by most recently played / most playtime
    games.sort((a, b) => (b.playtime_2weeks || 0) - (a.playtime_2weeks || 0) || b.playtime_forever - a.playtime_forever);
    return games;
  } catch (err) {
    console.error('getOwnedGames error:', err);
    return [];
  }
}

export async function getPlayerSummary(
  apiKey: string,
  steamId: string
): Promise<SteamPlayer | null> {
  try {
    const url = `${STEAM_BASE}/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Steam API error: ${res.status}`);
    const data = await res.json();
    const players = data?.response?.players;
    return players?.length > 0 ? players[0] : null;
  } catch (err) {
    console.error('getPlayerSummary error:', err);
    return null;
  }
}

export async function getRecentlyPlayed(
  apiKey: string,
  steamId: string
): Promise<SteamGame[]> {
  try {
    const url = `${STEAM_BASE}/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${apiKey}&steamid=${steamId}&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Steam API error: ${res.status}`);
    const data = await res.json();
    return (data?.response?.games || []).map((g: any) => ({
      ...g,
      headerImage: getHeaderImage(g.appid),
    }));
  } catch (err) {
    console.error('getRecentlyPlayed error:', err);
    return [];
  }
}

export async function getGameNews(appid: number, count = 10): Promise<SteamNewsItem[]> {
  try {
    const url = `${STEAM_BASE}/ISteamNews/GetNewsForApp/v0002/?appid=${appid}&count=${count}&maxlength=300&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Steam API error: ${res.status}`);
    const data = await res.json();
    return data?.appnews?.newsitems || [];
  } catch (err) {
    console.error('getGameNews error:', err);
    return [];
  }
}

export async function getFeaturedGames(): Promise<any> {
  try {
    const res = await fetch(`${STEAM_STORE}/api/featured/`);
    if (!res.ok) throw new Error(`Steam Store error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('getFeaturedGames error:', err);
    return null;
  }
}

export function formatPlaytime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours >= 100) return `${hours}h`;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getPersonaState(state: number): { label: string; color: string } {
  switch (state) {
    case 0: return { label: 'Offline', color: '#64748B' };
    case 1: return { label: 'Online', color: '#22C55E' };
    case 2: return { label: 'Busy', color: '#EF4444' };
    case 3: return { label: 'Away', color: '#F59E0B' };
    case 4: return { label: 'Snooze', color: '#F59E0B' };
    case 5: return { label: 'Looking to Trade', color: '#22C55E' };
    case 6: return { label: 'Looking to Play', color: '#22C55E' };
    default: return { label: 'Unknown', color: '#64748B' };
  }
}
