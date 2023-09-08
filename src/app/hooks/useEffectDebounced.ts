import { useEffect } from 'react';

const DEFAULT_TIMEOUT = 250;

export function useEffectDebounced(callbackFunction: () => void, timeout?: number) {
  useEffect(() => {
    let realTimeout = DEFAULT_TIMEOUT;
    if (timeout) {
      realTimeout = timeout;
    }

    const debouncedTimer = setTimeout(callbackFunction, realTimeout);
    return () => {
      clearTimeout(debouncedTimer);
    };
  }, [callbackFunction, timeout]);
}
