import { useState, useEffect } from "react";

/**
 * Works exactly like useState, but reads its initial value from
 * localStorage and writes back to it on every change. This is what lets
 * the reader/writer app and the separate /admin page see the same data
 * (library, wallet, published stories, moderation queue, etc.) without a
 * real backend, and lets progress survive a page reload.
 */
export function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // localStorage unavailable (private browsing, storage full, etc.) — fail silently
    }
  }, [key, state]);

  return [state, setState];
}
