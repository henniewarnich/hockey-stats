import { useState, useRef, useEffect, useCallback } from 'react';

export function useMatchTimer() {
  const [matchTime, setMatchTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [matchState, setMatchState] = useState("idle"); // idle | running | paused | ended
  const [speed, setSpeed] = useState(1); // 1 | 1.5 | 2
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      const ms = Math.round(1000 / speed);
      intervalRef.current = setInterval(() => setMatchTime(t => t + 1), ms);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, speed]);

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
    setSpeed(1);
  }, []);

  return {
    matchTime,
    running,
    matchState,
    speed,
    start,
    pause,
    resume,
    end,
    reset,
    setMatchTime,
    setMatchState,
    setRunning,
    setSpeed,
  };
}
