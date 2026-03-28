// Global App Context — State management for GameHand
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SteamGame, SteamPlayer } from '../services/steamApi';
import type { BreakRule } from '../services/notificationService';
import { getDefaultRules } from '../services/notificationService';

// --- Types ---
export interface SessionStats {
  totalMinutesToday: number;
  totalMinutesWeek: number;
  sessionsToday: number;
  lastSessionDate: string;
}

export interface PCStatus {
  connected: boolean;
  currentGame: string | null;
  currentGameAppId: number | null;
  sessionDuration: number; // seconds
  pcName: string | null;
}

export interface AppState {
  // Timer
  isTimerRunning: boolean;
  timerStartedAt: number | null; // timestamp
  accumulatedSeconds: number;
  sessionStats: SessionStats;

  // Steam
  steamApiKey: string;
  steamId: string;
  steamPlayer: SteamPlayer | null;
  steamGames: SteamGame[];
  gamesLoading: boolean;

  // PC Connection
  pcStatus: PCStatus;
  pcIpAddress: string;

  // Notifications
  breakRules: BreakRule[];
  notificationsEnabled: boolean;

  // Settings
  isSetupComplete: boolean;
}

type Action =
  | { type: 'START_TIMER' }
  | { type: 'STOP_TIMER'; payload: { elapsed: number } }
  | { type: 'RESET_TIMER' }
  | { type: 'TICK_TIMER'; payload: { elapsed: number } }
  | { type: 'SET_STEAM_CREDENTIALS'; payload: { apiKey: string; steamId: string } }
  | { type: 'SET_STEAM_PLAYER'; payload: SteamPlayer | null }
  | { type: 'SET_STEAM_GAMES'; payload: SteamGame[] }
  | { type: 'SET_GAMES_LOADING'; payload: boolean }
  | { type: 'SET_PC_STATUS'; payload: Partial<PCStatus> }
  | { type: 'SET_PC_IP'; payload: string }
  | { type: 'SET_BREAK_RULES'; payload: BreakRule[] }
  | { type: 'TOGGLE_NOTIFICATIONS'; payload: boolean }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'SET_SETUP_COMPLETE'; payload: boolean };

const initialState: AppState = {
  isTimerRunning: false,
  timerStartedAt: null,
  accumulatedSeconds: 0,
  sessionStats: {
    totalMinutesToday: 0,
    totalMinutesWeek: 0,
    sessionsToday: 0,
    lastSessionDate: '',
  },
  steamApiKey: '',
  steamId: '',
  steamPlayer: null,
  steamGames: [],
  gamesLoading: false,
  pcStatus: {
    connected: false,
    currentGame: null,
    currentGameAppId: null,
    sessionDuration: 0,
    pcName: null,
  },
  pcIpAddress: '',
  breakRules: getDefaultRules(),
  notificationsEnabled: true,
  isSetupComplete: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'START_TIMER':
      return {
        ...state,
        isTimerRunning: true,
        timerStartedAt: Date.now(),
      };
    case 'STOP_TIMER':
      return {
        ...state,
        isTimerRunning: false,
        timerStartedAt: null,
        accumulatedSeconds: state.accumulatedSeconds + action.payload.elapsed,
        sessionStats: {
          ...state.sessionStats,
          totalMinutesToday: state.sessionStats.totalMinutesToday + Math.floor(action.payload.elapsed / 60),
          sessionsToday: state.sessionStats.sessionsToday + 1,
          lastSessionDate: new Date().toISOString().split('T')[0],
        },
      };
    case 'RESET_TIMER':
      return {
        ...state,
        isTimerRunning: false,
        timerStartedAt: null,
        accumulatedSeconds: 0,
      };
    case 'TICK_TIMER':
      return state; // Timer display is driven by the hook, not state
    case 'SET_STEAM_CREDENTIALS':
      return {
        ...state,
        steamApiKey: action.payload.apiKey,
        steamId: action.payload.steamId,
        isSetupComplete: !!(action.payload.apiKey && action.payload.steamId),
      };
    case 'SET_STEAM_PLAYER':
      return { ...state, steamPlayer: action.payload };
    case 'SET_STEAM_GAMES':
      return { ...state, steamGames: action.payload, gamesLoading: false };
    case 'SET_GAMES_LOADING':
      return { ...state, gamesLoading: action.payload };
    case 'SET_PC_STATUS':
      return { ...state, pcStatus: { ...state.pcStatus, ...action.payload } };
    case 'SET_PC_IP':
      return { ...state, pcIpAddress: action.payload };
    case 'SET_BREAK_RULES':
      return { ...state, breakRules: action.payload };
    case 'TOGGLE_NOTIFICATIONS':
      return { ...state, notificationsEnabled: action.payload };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    case 'SET_SETUP_COMPLETE':
      return { ...state, isSetupComplete: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

const STORAGE_KEY = '@gamehand_state';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          dispatch({
            type: 'LOAD_STATE',
            payload: {
              steamApiKey: parsed.steamApiKey || '',
              steamId: parsed.steamId || '',
              pcIpAddress: parsed.pcIpAddress || '',
              breakRules: parsed.breakRules || getDefaultRules(),
              notificationsEnabled: parsed.notificationsEnabled ?? true,
              sessionStats: parsed.sessionStats || initialState.sessionStats,
              isSetupComplete: !!(parsed.steamApiKey && parsed.steamId),
            },
          });
        }
      } catch (err) {
        console.error('Failed to load state:', err);
      }
    })();
  }, []);

  // Persist state on changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      const toStore = {
        steamApiKey: state.steamApiKey,
        steamId: state.steamId,
        pcIpAddress: state.pcIpAddress,
        breakRules: state.breakRules,
        notificationsEnabled: state.notificationsEnabled,
        sessionStats: state.sessionStats,
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toStore)).catch(console.error);
    }, 500);
    return () => clearTimeout(debounce);
  }, [state.steamApiKey, state.steamId, state.pcIpAddress, state.breakRules, state.notificationsEnabled, state.sessionStats]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

export default AppContext;
