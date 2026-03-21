import { useState, useRef, useEffect, useCallback } from 'react';

export function useMatchTimer() {
  const [matchTime, setMatchTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [matchState, setMatchState] = useState("idle"); // idle | running | paused | ended
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setMatchTime(t => t + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const start = useCallback(() => {
    setRunning(true);
    setMatchState("running");
  }, []);

  const pause = useCallback(() => {
    setRunning(false);
    setMatchState("paused");
  }, []);

  const resume = useCallback(() => {
    setRunning(true);
    setMatchState("running");
  }, []);

  const end = useCallback(() => {
    setRunning(false);
    setMatchState("ended");
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setMatchState("idle");
    setMatchTime(0);
  }, []);

  return {
    matchTime,
    running,
    matchState,
    start,
    pause,
    resume,
    end,
    reset,
    setMatchTime,
    setMatchState,
    setRunning,
  };
}
