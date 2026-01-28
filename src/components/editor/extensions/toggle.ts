import { Node, mergeAttributes } from '@tiptap/core';

export interface ToggleOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggle: {
      setToggle: () => ReturnType;
      toggleToggle: () => ReturnType;
    };
  }
}

export const Toggle = Node.create<ToggleOptions>({
  name: 'toggle',

  group: 'block',

  content: 'toggleSummary toggleContent',

  parseHTML() {
    return [
      {
        tag: 'details',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setToggle:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [
              {
                type: 'toggleSummary',
                content: [
                  {
                    type: 'text',
                    text: 'Toggle',
                  },
                ],
              },
              {
                type: 'toggleContent',
                content: [
                  {
                    type: 'paragraph',
                  },
                ],
              },
            ],
          });
        },
      toggleToggle:
        () =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph');
        },
    };
  },
});

export const ToggleSummary = Node.create({
  name: 'toggleSummary',

  content: 'inline*',

  parseHTML() {
    return [
      {
        tag: 'summary',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['summary', mergeAttributes(HTMLAttributes), 0];
  },
});

export const ToggleContent = Node.create({
  name: 'toggleContent',

  content: 'block+',

  parseHTML() {
    return [
      {
        tag: 'div[data-type="toggle-content"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'toggle-content' }),
      0,
    ];
  },
});
