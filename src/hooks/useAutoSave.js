import { useEffect, useRef, useCallback } from 'react';

const DB_NAME = 'hockey-stats-autosave';
const STORE_NAME = 'matches';
const AUTOSAVE_KEY = 'current-match';
const INTERVAL_MS = 30000; // 30 seconds

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveToIDB(data) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(data, AUTOSAVE_KEY);
    await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
  } catch (e) {
    console.warn('Auto-save failed:', e);
  }
}

async function loadFromIDB() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(AUTOSAVE_KEY);
    return new Promise((res) => {
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => res(null);
    });
  } catch {
    return null;
  }
}

async function clearIDB() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(AUTOSAVE_KEY);
  } catch (e) {
    console.warn('Clear auto-save failed:', e);
  }
}

export function useAutoSave(getState, isActive) {
  const timerRef = useRef(null);
  const getStateRef = useRef(getState);
  getStateRef.current = getState;

  useEffect(() => {
    if (!isActive) {
      clearInterval(timerRef.current);
      return;
    }

    // Save immediately when becoming active
    saveToIDB(getStateRef.current());

    timerRef.current = setInterval(() => {
      saveToIDB(getStateRef.current());
    }, INTERVAL_MS);

    return () => clearInterval(timerRef.current);
  }, [isActive]);

  const saveNow = useCallback(() => {
    return saveToIDB(getStateRef.current());
  }, []);

  return { saveNow, clearAutoSave: clearIDB, loadAutoSave: loadFromIDB };
}
