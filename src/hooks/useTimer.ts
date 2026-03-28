// useTimer Hook — Session timer with precise interval
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

export function useTimer() {
  const { state, dispatch } = useAppContext();
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Calculate current elapsed time
  const getElapsed = useCallback(() => {
    if (!startTimeRef.current) return 0;
    return Math.floor((Date.now() - startTimeRef.current) / 1000);
  }, []);

  // Tick the display
  useEffect(() => {
    if (state.isTimerRunning && state.timerStartedAt) {
      startTimeRef.current = state.timerStartedAt;
      intervalRef.current = setInterval(() => {
        setDisplaySeconds(state.accumulatedSeconds + getElapsed());
      }, 200); // Update 5x per second for smooth display

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
      setDisplaySeconds(state.accumulatedSeconds);
      startTimeRef.current = null;
    }
  }, [state.isTimerRunning, state.timerStartedAt, state.accumulatedSeconds, getElapsed]);

  const start = useCallback(() => {
    dispatch({ type: 'START_TIMER' });
  }, [dispatch]);

  const stop = useCallback(() => {
    const elapsed = getElapsed();
    dispatch({ type: 'STOP_TIMER', payload: { elapsed } });
  }, [dispatch, getElapsed]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET_TIMER' });
    setDisplaySeconds(0);
  }, [dispatch]);

  const formatTime = useCallback((totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return {
      hours: h.toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      seconds: s.toString().padStart(2, '0'),
      formatted: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
    };
  }, []);

  return {
    seconds: displaySeconds,
    isRunning: state.isTimerRunning,
    time: formatTime(displaySeconds),
    start,
    stop,
    reset,
    sessionStats: state.sessionStats,
  };
}
