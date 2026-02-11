'use client';

import { useEffect } from 'react';

export function CodeBlockCopyButton() {
  useEffect(() => {
    const addCopyButtons = () => {
      const codeBlocks = document.querySelectorAll('.bn-code-block');

      codeBlocks.forEach((block) => {
        if (block.querySelector('.code-copy-button')) return;

        const button = document.createElement('div');
        button.className =
          'code-copy-button absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10';
        button.innerHTML = `
          <button class="inline-flex items-center justify-center gap-1 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-2 bg-background/80 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            <span class="text-xs">Copy</span>
          </button>
        `;

        const codeElement = block.querySelector('code') || block;
        button.addEventListener('click', async () => {
          try {
            const code = codeElement.textContent || '';
            await navigator.clipboard.writeText(code);

            button.innerHTML = `
              <button class="inline-flex items-center justify-center gap-1 rounded-md text-sm font-medium ring-offset-background transition-colors h-8 px-2 bg-background/80 backdrop-blur-sm text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                <span class="text-xs">Copied!</span>
              </button>
            `;

            setTimeout(() => {
              button.innerHTML = `
                <button class="inline-flex items-center justify-center gap-1 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-2 bg-background/80 backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2 2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  <span class="text-xs">Copy</span>
                </button>
              `;
            }, 2000);
          } catch (error) {
            console.error('Failed to copy code:', error);
          }
        });

        const parent = block.parentElement;
        if (parent) {
          parent.style.position = 'relative';
          parent.classList.add('group');
          parent.appendChild(button);
        }
      });
    };

    addCopyButtons();

    const observer = new MutationObserver(addCopyButtons);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
