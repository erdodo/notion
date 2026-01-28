import { Node, mergeAttributes } from '@tiptap/core';

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>;
}

export const Callout = Node.create<CalloutOptions>({
  name: 'callout',

  group: 'block',

  content: 'block+',

  addAttributes() {
    return {
      emoji: {
        default: '💡',
        parseHTML: (element) => element.getAttribute('data-emoji'),
        renderHTML: (attributes) => {
          return {
            'data-emoji': attributes.emoji,
          };
        },
      },
      backgroundColor: {
        default: 'gray',
        parseHTML: (element) => element.getAttribute('data-background'),
        renderHTML: (attributes) => {
          return {
            'data-background': attributes.backgroundColor,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'callout',
        class: 'callout',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
            content: [
              {
                type: 'paragraph',
              },
            ],
          });
        },
    };
  },
});
