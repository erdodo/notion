'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export const ThemeManager = () => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const styleId = 'blocknote-background-colors';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.append(styleElement);
    }

    const isDark = resolvedTheme === 'dark';
    const colors = [
      { name: 'default', light: 'transparent', dark: 'transparent' },
      { name: 'gray', light: 'rgb(241, 241, 239)', dark: 'rgb(71, 76, 80)' },
      { name: 'brown', light: 'rgb(244, 238, 234)', dark: 'rgb(67, 64, 64)' },
      { name: 'orange', light: 'rgb(251, 236, 221)', dark: 'rgb(89, 74, 58)' },
      { name: 'yellow', light: 'rgb(251, 243, 219)', dark: 'rgb(89, 86, 59)' },
      { name: 'green', light: 'rgb(237, 243, 236)', dark: 'rgb(53, 76, 75)' },
      { name: 'blue', light: 'rgb(231, 243, 248)', dark: 'rgb(45, 66, 86)' },
      { name: 'purple', light: 'rgb(244, 240, 247)', dark: 'rgb(73, 47, 100)' },
      { name: 'pink', light: 'rgb(249, 238, 243)', dark: 'rgb(83, 59, 76)' },
      { name: 'red', light: 'rgb(253, 235, 236)', dark: 'rgb(89, 65, 65)' },
    ];

    const css = colors
      .map((color) => {
        const bgColor = isDark ? color.dark : color.light;
        return `.bn-block-outer[data-background-color="${color.name}"] { background-color: ${bgColor}; border-radius: 3px; }`;
      })
      .join('\n');

    styleElement.textContent = css;
  }, [resolvedTheme]);

  return null;
};
