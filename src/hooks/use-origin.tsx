import { useState, useEffect } from 'react';

export const useOrigin = () => {
  const [mounted, setMounted] = useState(false);
  const origin =
    globalThis.window !== undefined && globalThis.location.origin
      ? globalThis.location.origin
      : '';

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return '';
  }

  return origin;
};
