import { Node, mergeAttributes } from '@tiptap/core';

export const Columns = Node.create({
  name: 'columns',
  group: 'block',
  content: 'column+',
  
  addAttributes() {
    return {
      columnCount: {
        default: 2,
        parseHTML: (element) => parseInt(element.getAttribute('data-columns') || '2'),
        renderHTML: (attributes) => ({ 'data-columns': attributes.columnCount }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="columns"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'columns' }), 0];
  },
});

export const Column = Node.create({
  name: 'column',
  content: 'block+',
  
  addAttributes() {
    return {
      width: {
        default: null,
        parseHTML: (element) => element.style.width || null,
        renderHTML: (attributes) => attributes.width ? { style: `width: ${attributes.width}` } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'column' }), 0];
  },
});
