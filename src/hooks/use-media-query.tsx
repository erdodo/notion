'use client';

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return globalThis.matchMedia(query).matches;
    }
    return false;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    const media = globalThis.matchMedia(query);

    const listener = () => {
      setMatches(media.matches);
    };
    media.addEventListener('change', listener);

    return () => {
      clearTimeout(timer);
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return mounted ? matches : false;
}
